import { JsonCompatibleArray, JsonCompatibleDictionary, JsonCompatibleValue } from "./jsoncompatibledictionary";
export interface JsonRpcRequest {
    readonly jsonrpc: "2.0";
    readonly id: number;
    readonly method: string;
    readonly params: JsonCompatibleArray | JsonCompatibleDictionary;
}
export interface JsonRpcSuccessResponse {
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
export declare type JsonRpcResponse = JsonRpcSuccessResponse | JsonRpcErrorResponse;
export declare function isJsonRpcErrorResponse(response: JsonRpcResponse): response is JsonRpcErrorResponse;
/**
 * Error codes as specified in JSON-RPC 2.0
 *
 * @see https://www.jsonrpc.org/specification#error_object
 */
export declare const jsonRpcCode: {
    parseError: number;
    invalidRequest: number;
    methodNotFound: number;
    invalidParams: number;
    internalError: number;
    serverError: {
        default: number;
    };
};
/** @deprecated: use jsonRpcCode */
export declare const jsonRpcCodeParseError: number;
/** @deprecated: use jsonRpcCode */
export declare const jsonRpcCodeInvalidRequest: number;
/** @deprecated: use jsonRpcCode */
export declare const jsonRpcCodeMethodNotFound: number;
/** @deprecated: use jsonRpcCode */
export declare const jsonRpcCodeInvalidParams: number;
/** @deprecated: use jsonRpcCode */
export declare const jsonRpcCodeInternalError: number;
/** @deprecated: use jsonRpcCode */
export declare const jsonRpcCodeServerErrorDefault: number;
