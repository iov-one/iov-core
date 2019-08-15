/* tslint:disable:readonly-keyword readonly-array no-object-mutation */
import {
  isJsonRpcErrorResponse,
  JsonRpcId,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccessResponse,
} from "@iov/jsonrpc";
import { ConnectionStatus, ReconnectingSocket } from "@iov/socket";
import { firstEvent } from "@iov/stream";
import { Stream } from "xstream";

import { hasProtocol, RpcStreamingClient, SubscriptionEvent } from "./rpcclient";
import { ReconnectingRpcEventProducer } from "./rpceventproducer";
import { defaultErrorHandler, toJsonRpcResponse } from "./utils";

export class WebsocketClient implements RpcStreamingClient {
  private readonly url: string;
  private readonly socket: ReconnectingSocket;
  /** Same events as in socket.events but in the format we need */
  private readonly jsonRpcResponseStream: Stream<JsonRpcResponse>;

  // Lazily create streams and use the same stream when listening to the same query twice.
  //
  // Creating streams is cheap since producer is not started as long as nobody listens to events. Thus this
  // map is never cleared and there is no need to do so. But unsubscribe all the subscriptions!
  private readonly subscriptionStreams = new Map<string, Stream<SubscriptionEvent>>();
  private producers: ReconnectingRpcEventProducer[] = [];

  public constructor(
    baseUrl: string = "ws://localhost:46657",
    onError: (err: any) => void = defaultErrorHandler,
  ) {
    // accept host.name:port and assume ws protocol
    // make sure we don't end up with ...//websocket
    const path = baseUrl.endsWith("/") ? "websocket" : "/websocket";
    const cleanBaseUrl = hasProtocol(baseUrl) ? baseUrl : "ws://" + baseUrl;
    this.url = cleanBaseUrl + path;

    this.socket = new ReconnectingSocket(this.url, undefined, this.reconnectedHandler.bind(this));

    const errorSubscription = this.socket.events.subscribe({
      error: error => {
        onError(error);
        errorSubscription.unsubscribe();
      },
    });

    this.jsonRpcResponseStream = this.socket.events.map(toJsonRpcResponse);

    this.socket.connect();
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccessResponse> {
    const pendingResponse = this.responseForRequestId(request.id);
    this.socket.queueRequest(JSON.stringify(request));

    const response = await pendingResponse;
    if (isJsonRpcErrorResponse(response)) {
      throw new Error(JSON.stringify(response.error));
    }
    return response;
  }

  public listen(request: JsonRpcRequest): Stream<SubscriptionEvent> {
    if (request.method !== "subscribe") {
      throw new Error(`Request method must be "subscribe" to start event listening`);
    }

    const query = (request.params as any).query;
    if (typeof query !== "string") {
      throw new Error("request.params.query must be a string");
    }

    if (!this.subscriptionStreams.has(query)) {
      const producer = new ReconnectingRpcEventProducer(request, this.socket);
      this.producers.push(producer);
      const stream = Stream.create(producer);
      this.subscriptionStreams.set(query, stream);
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return this.subscriptionStreams.get(query)!;
  }

  /**
   * Resolves as soon as websocket is connected. execute() queues requests automatically,
   * so this should be required for testing purposes only.
   */
  public async connected(): Promise<void> {
    await this.socket.connectionStatus.waitFor(ConnectionStatus.Connected);
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  protected async responseForRequestId(id: JsonRpcId): Promise<JsonRpcResponse> {
    return firstEvent(this.jsonRpcResponseStream.filter(r => r.id === id));
  }

  private reconnectedHandler(): void {
    this.producers.forEach(producer => producer.reconnect());
  }
}
