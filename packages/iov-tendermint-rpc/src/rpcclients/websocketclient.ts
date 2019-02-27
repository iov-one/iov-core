/* tslint:disable:readonly-keyword readonly-array no-object-mutation */
import { Listener, Producer, Stream, Subscription } from "xstream";

import { SocketWrapperMessageEvent, StreamingSocket } from "@iov/socket";
import { firstEvent } from "@iov/stream";

import {
  ifError,
  JsonRpcEvent,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccess,
  throwIfError,
} from "../jsonrpc";

import { hasProtocol, RpcStreamingClient } from "./rpcclient";

function defaultErrorHandler(error: any): never {
  throw error;
}

function toJsonRpcResponse(message: SocketWrapperMessageEvent): JsonRpcResponse {
  // this should never happen, but I want an alert if it does
  if (message.type !== "message") {
    throw new Error(`Unexcepted message type on websocket: ${message.type}`);
  }

  const jsonRpcEvent: JsonRpcResponse = JSON.parse(message.data);
  return jsonRpcEvent;
}

export class WebsocketClient implements RpcStreamingClient {
  private readonly url: string;
  private readonly socket: StreamingSocket;
  /** Same events as in socket.events but in the format we need */
  private readonly jsonRpcResponseStream: Stream<JsonRpcResponse>;

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

    this.socket = new StreamingSocket(this.url);

    const errorSubscription = this.socket.events.subscribe({
      error: error => {
        onError(error);
        errorSubscription.unsubscribe();
      },
    });

    this.jsonRpcResponseStream = this.socket.events.map(toJsonRpcResponse);

    this.socket.connect();
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    const pendingResponse = this.responseForRequestId(request.id);
    await this.socket.connected;
    const pendingSend = this.socket.send(JSON.stringify(request));

    const response = (await Promise.all([pendingResponse, pendingSend]))[0];
    return throwIfError(response);
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
      const producer = new RpcEventProducer(request, this.socket);
      const stream = Stream.create(producer);
      this.subscriptionStreams.set(query, stream);
    }
    return this.subscriptionStreams.get(query)!;
  }

  /**
   * Resolves as soon as websocket is connected. execute() queues requests automatically,
   * so this should be required for testing purposes only.
   */
  public async connected(): Promise<void> {
    return this.socket.connected;
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  protected async responseForRequestId(id: string): Promise<JsonRpcResponse> {
    return firstEvent(this.jsonRpcResponseStream.filter(r => r.id === id));
  }
}

class RpcEventProducer implements Producer<JsonRpcEvent> {
  private readonly request: JsonRpcRequest;
  private readonly socket: StreamingSocket;

  private running: boolean = false;
  private subscriptions: Subscription[] = [];

  constructor(request: JsonRpcRequest, socket: StreamingSocket) {
    this.request = request;
    this.socket = socket;
  }

  /**
   * Implementation of Producer.start
   */
  public async start(listener: Listener<JsonRpcEvent>): Promise<void> {
    if (this.running) {
      throw Error("Already started. Please stop first before restarting.");
    }
    this.running = true;

    this.connectToClient(listener);

    await this.socket.connected.then(async () => {
      await this.socket.send(JSON.stringify(this.request)).catch(error => {
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
    const responseStream = this.socket.events.map(toJsonRpcResponse);

    // this should unsubscribe itself, so doesn't need to be removed explicitly
    const idSubscription = responseStream
      .filter(response => response.id === this.request.id)
      .subscribe({
        next: response => {
          const err = ifError(response);
          if (err) {
            this.closeSubscriptions();
            listener.error(err);
          }
          idSubscription.unsubscribe();
        },
      });

    // this will fire on a response (success or error)
    // Tendermint adds an "#event" suffix for events that follow a previous subscription
    // https://github.com/tendermint/tendermint/blob/v0.23.0/rpc/core/events.go#L107
    const idEventSubscription = responseStream
      .filter(response => response.id === `${this.request.id}#event`)
      .subscribe({
        next: response => {
          const err = ifError(response);
          if (err) {
            this.closeSubscriptions();
            listener.error(err);
          } else {
            const result = (response as JsonRpcSuccess).result;
            listener.next(result as JsonRpcEvent);
          }
        },
      });

    // this will fire in case the websocket disconnects cleanly
    const nonResponseSubscription = responseStream.subscribe({
      error: error => {
        this.closeSubscriptions();
        listener.error(error);
      },
      complete: () => {
        this.closeSubscriptions();
        listener.complete();
      },
    });

    this.subscriptions.push(idSubscription, idEventSubscription, nonResponseSubscription);
  }

  protected closeSubscriptions(): void {
    for (const subscription of this.subscriptions) {
      subscription.unsubscribe();
    }
    // clear unused subscriptions
    this.subscriptions = [];
  }
}
