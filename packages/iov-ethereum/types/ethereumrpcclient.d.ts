import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SocketWrapperMessageEvent } from "@iov/socket";
import { Stream } from "xstream";
export interface EthereumRpcClient {
  readonly events: Stream<SocketWrapperMessageEvent>;
  readonly run: (request: JsonRpcRequest) => Promise<JsonRpcResponse>;
  readonly socketSend: (request: JsonRpcRequest, ignoreNetworkError?: boolean) => Promise<void>;
  readonly disconnect: () => void;
}
