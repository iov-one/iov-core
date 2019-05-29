import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";

export interface JsonRpcClient {
  readonly run: (request: JsonRpcRequest) => Promise<JsonRpcResponse>;
}
