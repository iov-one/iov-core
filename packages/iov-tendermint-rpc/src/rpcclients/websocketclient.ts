/* tslint:disable:readonly-keyword readonly-array no-object-mutation */
import EventEmitter from "events";
import { Listener, Producer, Stream } from "xstream";

import {
  ifError,
  JsonRpcEvent,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccess,
  throwIfError,
} from "../jsonrpc";
import { SocketWrapper } from "../socketwrapper";

import { hasProtocol, RpcStreamingClient } from "./rpcclient";

function defaultErrorHandler(error: any): never {
  throw error;
}

export class WebsocketClient implements RpcStreamingClient {
  // Used to distribute socket events to interested listeners. Event types:
  // "<id>"        response messages to the request with <id>
  // "<id>#event"  events following the subscription request with <id>
  // "close"       when the socket has been closed in a more or less clean way
  // "error"       when an error occured
  private readonly bridge: EventEmitter;

  private readonly url: string;
  private readonly socket: SocketWrapper;

  // Lazily create streams and use the same stream when listening to the same query twice.
  //
  // Creating streams is cheap since producer is not started as long as nobody listens to events. Thus this
  // map is never cleared and there is no need to do so. But unsubscribe all the subscriptions!
  private readonly subscriptionStreams = new Map<string, Stream<JsonRpcEvent>>();

  constructor(baseUrl: string = "ws://localhost:46657", onError: (err: any) => void = defaultErrorHandler) {
    // accept host.name:port and assume ws protocol
    // make sure we don't end up with ...//websocket
    const path = baseUrl.endsWith("/") ? "websocket" : "/websocket";
    const cleanBaseUrl = hasProtocol(baseUrl) ? baseUrl : "ws://" + baseUrl;
    this.url = cleanBaseUrl + path;

    this.bridge = new EventEmitter();
    this.bridge.on("error", onError);

    this.socket = new SocketWrapper(
      this.url,
      message => {
        // this should never happen, but I want an alert if it does
        if (message.type !== "message") {
          this.bridge.emit("error", `Unexcepted message type on websocket: ${message.type}`);
        }
        const data = JSON.parse(message.data.toString());
        this.bridge.emit(data.id, data);
      },
      error => this.bridge.emit("error", error),
      () => 0,
      closeEvent => {
        if (closeEvent.wasClean) {
          this.bridge.emit("close");
        } else {
          const debug = `clean: ${closeEvent.wasClean}, code: ${closeEvent.code}`;
          this.bridge.emit("error", `Websocket closed (${debug})`);
        }
      },
    );
    this.socket.connect();
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    const responsePromise = this.responseForRequestId(request.id).then(throwIfError);

    await this.socket.connected;
    await this.socket.send(JSON.stringify(request));

    const response = await responsePromise;
    return response;
  }

  public listen(request: JsonRpcRequest): Stream<JsonRpcEvent> {
    if (request.method !== "subscribe") {
      throw new Error(`Request method must be "subscribe" to start event listening`);
    }

    const query = (request.params as any).query;
    if (typeof query !== "string") {
      throw new Error("request.params.query must be a string");
    }

    if (!this.subscriptionStreams.has(query)) {
      const producer = new RpcEventProducer(request, this.socket, this.bridge);
      const stream = Stream.create(producer);
      this.subscriptionStreams.set(query, stream);
    }
    return this.subscriptionStreams.get(query)!;
  }

  /**
   * Resolves as soon as websocket is connected. execute() queues requests automatically,
   * so this should be required for testing purposes only.
   */
  public connected(): Promise<void> {
    return this.socket.connected;
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  protected responseForRequestId(id: string): Promise<JsonRpcResponse> {
    return new Promise((resolve, reject) => {
      // only one of the two listeners should fire, and it will
      // deregister the other so as not to cause a leak.

      const good = {
        eventName: id,
        listener: (data: JsonRpcResponse) => {
          unregisterGoodAndBad();
          resolve(data);
        },
      };

      const bad = {
        eventName: "error",
        listener: (error: any) => {
          unregisterGoodAndBad();
          reject(error);
        },
      };

      const unregisterGoodAndBad = () => {
        this.bridge.removeListener(good.eventName, good.listener);
        this.bridge.removeListener(bad.eventName, bad.listener);
      };

      // this will fire on a response (success or error)
      this.bridge.once(good.eventName, good.listener);
      // this will fire in case the websocket errors/disconnects
      this.bridge.once(bad.eventName, bad.listener);
    });
  }
}

class RpcEventProducer implements Producer<JsonRpcEvent> {
  private readonly request: JsonRpcRequest;
  private readonly socket: SocketWrapper;
  private readonly bridge: EventEmitter;

  private running: boolean = false;
  private subscriptions: EventEmitter[] = [];

  constructor(request: JsonRpcRequest, socket: SocketWrapper, bridge: EventEmitter) {
    this.request = request;
    this.socket = socket;
    this.bridge = bridge;
  }

  /**
   * Implementation of Producer.start
   */
  public start(listener: Listener<JsonRpcEvent>): void {
    if (this.running) {
      throw Error("Already started. Please stop first before restarting.");
    }
    this.running = true;

    this.connectToClient(listener);

    this.socket.connected.then(() => {
      this.socket.send(JSON.stringify(this.request)).catch(error => {
        listener.error(error);
      });
    });
  }

  /**
   * Implementation of Producer.stop
   *
   * Called by the stream when the stream's last listener stopped listening
   * or when the producer completed.
   */
  public stop(): void {
    this.running = false;
    // Tell the server we are done in order to save resources. We cannot wait for the result.
    // This may fail when socket connection is not open, thus ignore errors in send
    const endRequest: JsonRpcRequest = { ...this.request, method: "unsubscribe" };
    this.socket.send(JSON.stringify(endRequest)).catch(_ => 0);
  }

  protected connectToClient(listener: Listener<JsonRpcEvent>): void {
    // this should unsubscribe itself, so doesn't need to be removed explicitly
    const idSubscription = this.bridge.once(this.request.id, data => {
      const err = ifError(data);
      if (err) {
        this.closeSubscriptions();
        listener.error(err);
      }
    });

    // this will fire on a response (success or error)
    // Tendermint adds an "#event" suffix for events that follow a previous subscription
    // https://github.com/tendermint/tendermint/blob/v0.23.0/rpc/core/events.go#L107
    const idEventSubscription = this.bridge.on(this.request.id + "#event", data => {
      const err = ifError(data);
      if (err) {
        this.closeSubscriptions();
        listener.error(err);
      } else {
        const result = (data as JsonRpcSuccess).result;
        listener.next(result as JsonRpcEvent);
      }
    });

    // this will fire in case the websocket disconnects cleanly
    const closeSubscription = this.bridge.once("close", () => {
      this.closeSubscriptions();
      listener.complete();
    });

    // this will fire in case the websocket errors/disconnects
    const errorSubscription = this.bridge.once("error", err => {
      this.closeSubscriptions();
      listener.error(err);
    });

    this.subscriptions.push(idSubscription, idEventSubscription, closeSubscription, errorSubscription);
  }

  protected closeSubscriptions(): void {
    for (const subscription of this.subscriptions) {
      subscription.removeAllListeners();
    }
    // clear unused subscriptions
    this.subscriptions = [];
  }
}
