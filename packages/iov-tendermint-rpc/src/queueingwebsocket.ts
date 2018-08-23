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
  private closed = false;

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
      this.connectedResolver!();

      if (this.openHandler) {
        this.openHandler();
      }
    };
    socket.onclose = closeEvent => {
      this.closed = true;
      if (this.closeHandler) {
        this.closeHandler(closeEvent);
      }
    };

    this.socket = socket;
  }

  /**
   * Closes an established connection and aborts other connection states
   */
  public disconnect(): void {
    if (!this.socket) {
      throw new Error("Socket undefined. This must be called after connecting.");
    }

    switch (this.socket.readyState) {
      case WebSocket.OPEN:
        this.socket.close(1000 /* Normal Closure */);
        break;
      case WebSocket.CLOSED:
        // nothing to be done
        break;
      case WebSocket.CONNECTING:
        // imitate missing abort API
        this.socket.onopen = () => 0;
        this.socket.onclose = () => 0;
        this.socket.onerror = () => 0;
        this.socket.onmessage = () => 0;
        this.socket = undefined;
        if (this.closeHandler) {
          this.closeHandler({ wasClean: false, code: 4001 });
        }
        break;
      case WebSocket.CLOSING:
        // already closing. Let it proceed
        break;
      default:
        throw new Error(`Unknown readyState: ${this.socket.readyState}`);
    }
  }

  public async sendNow(data: string): Promise<void> {
    if (!this.socket) {
      throw new Error("Socket undefined. This must be called after connecting.");
    }

    if (this.closed) {
      throw new Error("Socket was closed, so no data can be sent anymore.");
    }

    // this exception should be thrown by send() automatically according to
    // https://developer.mozilla.org/de/docs/Web/API/WebSocket#send() but it does not work in browsers
    if (this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Websocket is not open");
    }
    this.socket.send(data);
  }
}
