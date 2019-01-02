import { JsonCompatibleArray, JsonCompatibleDictionary, JsonCompatibleValue } from "./jsoncompatibledictionary";
export interface JsonRpcRequest {
    readonly jsonrpc: "2.0";
    readonly id: number;
    readonly method: string;
    readonly params: JsonCompatibleArray | JsonCompatibleDictionary;
}
export interface JsonRpcResponse {
    readonly jsonrpc: "2.0";
    readonly id: number;
    readonly result: any;
}
export interface JsonRpcError {
    readonly code: number;
    readonly message: string;
    readonly data?: JsonCompatibleValue;
}
/**
 * And error object as described in https://www.jsonrpc.org/specification#error_object
 */
export interface JsonRpcErrorResponse {
    readonly jsonrpc: "2.0";
    readonly id: number | null;
    readonly error: JsonRpcError;
}
export declare function isJsonRpcErrorResponse(response: JsonRpcResponse | JsonRpcErrorResponse): response is JsonRpcErrorResponse;
export declare const jsonRpcCodeParseError = -32700;
export declare const jsonRpcCodeInvalidRequest = -32600;
export declare const jsonRpcCodeMethodNotFound = -32601;
export declare const jsonRpcCodeInvalidParams = -32602;
export declare const jsonRpcCodeInternalError = -32603;
export declare const jsonRpcCodeServerErrorDefault = -32000;
