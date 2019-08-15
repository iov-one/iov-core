import { JsonRpcResponse, parseJsonRpcResponse } from "@iov/jsonrpc";
import { SocketWrapperMessageEvent } from "@iov/socket";

export function defaultErrorHandler(error: any): never {
  throw error;
}

export function toJsonRpcResponse(message: SocketWrapperMessageEvent): JsonRpcResponse {
  // this should never happen, but I want an alert if it does
  if (message.type !== "message") {
    throw new Error(`Unexcepted message type on websocket: ${message.type}`);
  }

  const jsonRpcEvent = parseJsonRpcResponse(JSON.parse(message.data));
  return jsonRpcEvent;
}
