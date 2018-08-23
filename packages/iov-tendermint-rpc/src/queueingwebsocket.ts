// tslint:disable:readonly-keyword no-object-mutation
import WebSocket from "isomorphic-ws";

export interface QueueingWebSocketCloseEvent {
  readonly wasClean: boolean;
  readonly code: number;
}

export interface QueueingWebSocketErrorEvent {
  // fields available in browsers
  readonly isTrusted?: boolean;

  // fields available in node
  readonly type?: string;
  readonly message?: string;
}

export interface QueueingWebSocketMessageEvent {
  readonly data: string;
  readonly type: string;
}

export class QueueingWebSocket {
  public readonly connected: Promise<void>;

  private connectedResolver: (() => void) | undefined;
  private socket: WebSocket | undefined;
  private opened = false;
  private closed = false;
  private readonly queue = new Array<string>();

  constructor(
    private readonly url: string,
    private readonly messageHandler: (event: QueueingWebSocketMessageEvent) => void,
    private readonly errorHandler: (event: QueueingWebSocketErrorEvent) => void,
    private readonly openHandler?: () => void,
    private readonly closeHandler?: (event: QueueingWebSocketCloseEvent) => void,
  ) {
    this.connected = new Promise((resolve, _) => {
      this.connectedResolver = resolve;
    });
  }

  /**
   * returns a promise that resolves when connection is open
   */
  public connect(): void {
    const socket = new WebSocket(this.url);

    socket.onerror = this.errorHandler;
    socket.onmessage = messageEvent => {
      this.messageHandler({
        type: messageEvent.type,
        data: messageEvent.data as string,
      });
    };
    socket.onopen = _ => {
      this.opened = true;

      this.connectedResolver!();

      if (this.openHandler) {
        this.openHandler();
      }

      this.processQueue();
    };
    socket.onclose = closeEvent => {
      this.closed = true;
      if (this.closeHandler) {
        this.closeHandler(closeEvent);
      }
    };

    this.socket = socket;
  }

  public disconnect(): void {
    if (!this.socket) {
      throw new Error("Socket undefined. This must be called after connecting.");
    }
    this.socket.close(1000 /* Normal Closure */);
  }

  /**
   * Sends data as soon as connection is established.
   *
   * Data may never be sent in case of disconnection.
   *
   * @param data data to be sent in the socket connection
   */
  public sendQueued(data: string): void {
    if (this.closed) {
      throw new Error("Socket was closed, so no data can be queued anymore.");
    }

    this.queue.push(data);
    if (this.opened) {
      this.processQueue();
    }
  }

  public async sendNow(data: string): Promise<void> {
    if (!this.socket) {
      throw new Error("Socket undefined. This must be called after connecting.");
    }

    // this exception should be thrown by send() automatically according to
    // https://developer.mozilla.org/de/docs/Web/API/WebSocket#send() but it does not work in browsers
    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Websocket is not open");
    }
    this.socket.send(data);
  }

  private processQueue(): void {
    if (!this.socket) {
      throw new Error("Socket undefined. This must be called after connecting.");
    }

    if (!this.opened) {
      throw new Error("Socket was not yet opened.");
    }

    // tslint:disable-next-line:no-let
    let element: string | undefined;
    // tslint:disable-next-line:no-conditional-assignment
    while ((element = this.queue.pop()) !== undefined) {
      // this exception should be thrown by send() automatically according to
      // https://developer.mozilla.org/de/docs/Web/API/WebSocket#send() but it does not work in browsers
      if (this.socket.readyState !== WebSocket.OPEN) {
        throw new Error("Websocket is not open");
      }
      this.socket.send(element);
    }
  }
}
