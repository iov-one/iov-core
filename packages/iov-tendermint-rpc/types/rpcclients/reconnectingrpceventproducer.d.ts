import { JsonRpcRequest } from "@iov/jsonrpc";
import { ReconnectingSocket } from "@iov/socket";
import { Listener, Producer } from "xstream";
import { SubscriptionEvent } from "./rpcclient";
export declare class ReconnectingRpcEventProducer implements Producer<SubscriptionEvent> {
  private readonly request;
  private readonly socket;
  private producer;
  private listener?;
  private stopped;
  constructor(request: JsonRpcRequest, socket: ReconnectingSocket);
  start(listener: Listener<SubscriptionEvent>): void;
  stop(): void;
  reconnect(): void;
}
