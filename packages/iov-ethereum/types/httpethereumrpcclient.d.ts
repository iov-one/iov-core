import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { EthereumRpcClient } from "./ethereumrpcclient";
export declare class HttpEthereumRpcClient implements EthereumRpcClient {
  readonly events: import("xstream").Stream<any>;
  private readonly baseUrl;
  constructor(baseUrl: string);
  run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
  socketSend(): Promise<void>;
  disconnect(): void;
}
