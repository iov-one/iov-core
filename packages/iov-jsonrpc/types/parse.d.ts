import { JsonRpcErrorResponse, JsonRpcRequest, JsonRpcSuccessResponse } from "./types";
export declare function parseJsonRpcId(data: unknown): number | null;
export declare function parseJsonRpcRequest(data: unknown): JsonRpcRequest;
/** Throws if data is not a JsonRpcErrorResponse */
export declare function parseJsonRpcErrorResponse(data: unknown): JsonRpcErrorResponse;
/** @deprecated use parseJsonRpcErrorResponse */
export declare function parseJsonRpcError(data: unknown): JsonRpcErrorResponse | undefined;
/** Throws if data is not a JsonRpcSuccessResponse */
export declare function parseJsonRpcSuccessResponse(data: unknown): JsonRpcSuccessResponse;
/** @deprecated use parseJsonRpcSuccessResponse */
export declare function parseJsonRpcResponse(data: unknown): JsonRpcSuccessResponse;
