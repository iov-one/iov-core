// tslint:disable:no-object-mutation readonly-array readonly-keyword
import { Stream } from "xstream";
// tslint:disable-next-line:no-submodule-imports
import concat from "xstream/extra/concat";

import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { SocketWrapperMessageEvent } from "./socketwrapper";
import { StreamingSocket } from "./streamingsocket";

function wrapStream<T>(stream: Stream<T>): Stream<T> {
  return concat(stream.replaceError(Stream.never), Stream.never());
}

export enum ConnectionStatus {
  Unconnected,
  Connecting,
  Connected,
  Disconnected,
}

/**
 * A wrapper around StreamingSocket that can queue requests.
 */
export class QueueingStreamingSocket {
  public readonly connectionStatus: ValueAndUpdates<ConnectionStatus>;
  public readonly events: Stream<SocketWrapperMessageEvent>;

  private readonly url: string;
  private readonly timeout: number;
  private readonly queue: string[] = [];
  private socket: StreamingSocket;
  private isProcessingQueue = false;
  private timeoutIndex = 0;
  private processQueueTimeout: NodeJS.Timeout | null = null;
  private connectionStatusProducer: DefaultValueProducer<ConnectionStatus>;
  private reconnectedHandler?: () => void;

  public constructor(url: string, timeout: number = 10_000, reconnectedHandler?: () => void) {
    this.url = url;
    this.timeout = timeout;
    this.socket = new StreamingSocket(this.url, this.timeout);
    this.events = wrapStream(this.socket.events);

    this.reconnectedHandler = reconnectedHandler;
    this.connectionStatusProducer = new DefaultValueProducer<ConnectionStatus>(ConnectionStatus.Unconnected);
    this.connectionStatus = new ValueAndUpdates(this.connectionStatusProducer);
    // tslint:disable-next-line:no-floating-promises
    this.socket.connected.then(() => this.connectionStatusProducer.update(ConnectionStatus.Connected));
  }

  public connect(): void {
    this.connectionStatusProducer.update(ConnectionStatus.Connecting);
    this.socket.connect();
  }

  public disconnect(): void {
    this.connectionStatusProducer.update(ConnectionStatus.Disconnected);
    this.socket.disconnect();
  }

  public reconnect(): void {
    this.socket = new StreamingSocket(this.url, this.timeout);
    this.events.imitate(wrapStream(this.socket.events));
    // tslint:disable-next-line:no-floating-promises
    this.socket.connected
      .then(() => {
        this.connectionStatusProducer.update(ConnectionStatus.Connected);
        if (this.reconnectedHandler) {
          this.reconnectedHandler();
        }
      })
      .then(() => this.processQueue());
    this.connect();
  }

  public getQueueLength(): number {
    return this.queue.length;
  }

  public queueRequest(request: string): void {
    this.queue.push(request);
    // We don’t need to wait for the queue to be processed.
    // tslint:disable-next-line:no-floating-promises
    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessingQueue) {
      return;
    }
    this.isProcessingQueue = true;
    if (this.processQueueTimeout) {
      clearTimeout(this.processQueueTimeout);
    }

    let request: string | undefined;
    while ((request = this.queue.shift())) {
      try {
        await this.socket.send(request);
        this.timeoutIndex = 0;
        this.isProcessingQueue = false;
      } catch (error) {
        // Probably the connection is down; try again in a bit.
        this.queue.unshift(request);
        this.isProcessingQueue = false;
        if (this.timeoutIndex <= 13) {
          // Starts with a 0.1 second timeout, then doubles every attempt with a maximum timeout of about 14 minutes.
          this.processQueueTimeout = setTimeout(() => this.processQueue(), 2 ** this.timeoutIndex++ * 100);
        }
        return;
      }
    }
  }
}
