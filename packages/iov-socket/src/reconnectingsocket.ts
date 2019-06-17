// tslint:disable:no-object-mutation readonly-keyword
import { Listener, Producer, Stream } from "xstream";

import { ValueAndUpdates } from "@iov/stream";

import { ConnectionStatus, QueueingStreamingSocket } from "./queueingstreamingsocket";
import { SocketWrapperMessageEvent } from "./socketwrapper";

/**
 * A wrapper around QueueingStreamingSocket that reconnects automatically.
 */
export class ReconnectingSocket {
  /** Starts with a 0.1 second timeout, then doubles every attempt with a maximum timeout of 5 seconds. */
  private static calculateTimeout(index: number): number {
    return Math.min(2 ** index * 100, 5_000);
  }

  public readonly connectionStatus: ValueAndUpdates<ConnectionStatus>;
  public readonly events: Stream<SocketWrapperMessageEvent>;

  private readonly socket: QueueingStreamingSocket;
  private eventProducerListener: Listener<SocketWrapperMessageEvent> | undefined;
  private unconnected: boolean = true;
  private timeoutIndex = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  public constructor(url: string, timeout: number = 10_000, reconnectedHandler?: () => void) {
    const eventProducer: Producer<any> = {
      start: listener => (this.eventProducerListener = listener),
      stop: () => (this.eventProducerListener = undefined),
    };
    this.events = Stream.create(eventProducer);

    this.socket = new QueueingStreamingSocket(url, timeout, reconnectedHandler);
    this.socket.events.subscribe({
      next: event => {
        if (!this.eventProducerListener) throw new Error("No event producer listener set");
        this.eventProducerListener.next(event);
      },
      error: error => {
        if (!this.eventProducerListener) throw new Error("No event producer listener set");
        this.eventProducerListener.error(error);
      },
    });

    this.connectionStatus = this.socket.connectionStatus;
    this.connectionStatus.updates.subscribe({
      next: status => {
        if (this.unconnected && status === ConnectionStatus.Connected) {
          this.unconnected = false;
          this.timeoutIndex = 0;
        }
        if (status === ConnectionStatus.Disconnected) {
          if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
          }
          this.reconnectTimeout = setTimeout(
            () => this.socket.reconnect(),
            ReconnectingSocket.calculateTimeout(this.timeoutIndex++),
          );
        }
      },
    });
  }

  public connect(): void {
    if (!this.unconnected) {
      throw new Error("Cannot connect: socket has already connected");
    }
    this.socket.connect();
  }

  public disconnect(): void {
    if (this.unconnected) {
      throw new Error("Cannot disconnect: socket has not yet connected");
    }
    this.socket.disconnect();
    if (!this.eventProducerListener) throw new Error("xxxNo event producer listener set");
    this.eventProducerListener.complete();
  }

  public queueRequest(request: string): void {
    this.socket.queueRequest(request);
  }
}
