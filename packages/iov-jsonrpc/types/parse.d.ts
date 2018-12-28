import { JsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse } from "./types";
export declare function parseJsonRpcId(data: any): number | null;
export declare function parseJsonRpcRequest(data: any): JsonRpcRequest;
export declare function parseJsonRpcError(data: any): JsonRpcErrorResponse | undefined;
export declare function parseJsonRpcResponse(data: any): JsonRpcResponse;
