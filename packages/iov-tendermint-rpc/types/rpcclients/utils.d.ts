import { JsonRpcResponse } from "@iov/jsonrpc";
import { SocketWrapperMessageEvent } from "@iov/socket";
export declare function defaultErrorHandler(error: any): never;
export declare function toJsonRpcResponse(message: SocketWrapperMessageEvent): JsonRpcResponse;
