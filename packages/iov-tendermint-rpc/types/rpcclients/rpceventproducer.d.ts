import { JsonRpcRequest } from "@iov/jsonrpc";
import { ReconnectingSocket } from "@iov/socket";
import { Listener, Producer } from "xstream";
import { SubscriptionEvent } from "./rpcclient";
export declare class RpcEventProducer implements Producer<SubscriptionEvent> {
  private readonly request;
  private readonly socket;
  private running;
  private subscriptions;
  constructor(request: JsonRpcRequest, socket: ReconnectingSocket);
  /**
   * Implementation of Producer.start
   */
  start(listener: Listener<SubscriptionEvent>): void;
  /**
   * Implementation of Producer.stop
   *
   * Called by the stream when the stream's last listener stopped listening
   * or when the producer completed.
   */
  stop(): void;
  protected connectToClient(listener: Listener<SubscriptionEvent>): void;
  protected closeSubscriptions(): void;
}
