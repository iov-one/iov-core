import { JsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse } from "./types";
export declare function parseJsonRpcId(data: unknown): number | null;
export declare function parseJsonRpcRequest(data: unknown): JsonRpcRequest;
export declare function parseJsonRpcError(data: unknown): JsonRpcErrorResponse | undefined;
export declare function parseJsonRpcResponse(data: unknown): JsonRpcResponse;
