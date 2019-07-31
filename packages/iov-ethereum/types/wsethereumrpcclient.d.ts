import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SocketWrapperMessageEvent } from "@iov/socket";
import { Stream } from "xstream";
import { EthereumRpcClient } from "./ethereumrpcclient";
export declare class WsEthereumRpcClient implements EthereumRpcClient {
  readonly events: Stream<SocketWrapperMessageEvent>;
  private readonly socket;
  constructor(baseUrl: string);
  run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
  socketSend(request: JsonRpcRequest, ignoreNetworkError?: boolean): Promise<void>;
  disconnect(): void;
}
