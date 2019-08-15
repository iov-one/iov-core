/* tslint:disable:readonly-keyword readonly-array no-object-mutation */
import { isJsonRpcErrorResponse, JsonRpcRequest } from "@iov/jsonrpc";
import { ReconnectingSocket } from "@iov/socket";
import { Listener, Producer, Subscription } from "xstream";

import { SubscriptionEvent } from "./rpcclient";
import { toJsonRpcResponse } from "./utils";

export class RpcEventProducer implements Producer<SubscriptionEvent> {
  private readonly request: JsonRpcRequest;
  private readonly socket: ReconnectingSocket;

  private running: boolean = false;
  private subscriptions: Subscription[] = [];

  public constructor(request: JsonRpcRequest, socket: ReconnectingSocket) {
    this.request = request;
    this.socket = socket;
  }

  /**
   * Implementation of Producer.start
   */
  public start(listener: Listener<SubscriptionEvent>): void {
    if (this.running) {
      throw Error("Already started. Please stop first before restarting.");
    }
    this.running = true;

    this.connectToClient(listener);

    this.socket.queueRequest(JSON.stringify(this.request));
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
    // This may fail when socket connection is not open, thus ignore errors in queueRequest
    const endRequest: JsonRpcRequest = { ...this.request, method: "unsubscribe" };
    try {
      this.socket.queueRequest(JSON.stringify(endRequest));
    } catch (error) {
      if (error instanceof Error && error.message.match(/socket has disconnected/i)) {
        // ignore
      } else {
        throw error;
      }
    }
  }

  protected connectToClient(listener: Listener<SubscriptionEvent>): void {
    const responseStream = this.socket.events.map(toJsonRpcResponse);

    // this should unsubscribe itself, so doesn't need to be removed explicitly
    const idSubscription = responseStream
      .filter(response => response.id === this.request.id)
      .subscribe({
        next: response => {
          if (isJsonRpcErrorResponse(response)) {
            this.closeSubscriptions();
            listener.error(JSON.stringify(response.error));
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
          if (isJsonRpcErrorResponse(response)) {
            this.closeSubscriptions();
            listener.error(JSON.stringify(response.error));
          } else {
            listener.next(response.result as SubscriptionEvent);
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

export class ReconnectingRpcEventProducer implements Producer<SubscriptionEvent> {
  public stopped: boolean = false;
  private request: JsonRpcRequest;
  private socket: ReconnectingSocket;
  private producer: RpcEventProducer;
  private listener?: Listener<SubscriptionEvent>;

  public constructor(request: JsonRpcRequest, socket: ReconnectingSocket) {
    this.request = request;
    this.socket = socket;
    this.producer = new RpcEventProducer(this.request, this.socket);
  }

  public start(listener: Listener<SubscriptionEvent>): void {
    this.listener = listener;
    this.producer.start(this.listener);
  }

  public stop(): void {
    this.producer.stop();
    this.stopped = true;
  }

  public reconnect(): void {
    if (!this.stopped) {
      this.producer.stop();
      this.producer = new RpcEventProducer(this.request, this.socket);
      if (this.listener) {
        this.producer.start(this.listener);
      }
    }
  }
}
