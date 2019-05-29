import { Stream } from "xstream";

import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SocketWrapperMessageEvent } from "@iov/socket";

export interface JsonRpcClient {
  readonly events: Stream<SocketWrapperMessageEvent>;
  readonly run: (request: JsonRpcRequest) => Promise<JsonRpcResponse>;
  readonly socketSend: (request: JsonRpcRequest, ignoreNetworkError?: boolean) => Promise<void>;
  readonly disconnect: () => void;
}
