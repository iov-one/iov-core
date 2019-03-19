import { SimpleMessagingConnection } from "@iov/jsonrpc";
/** A single structured clone algorithm compatible value */
export declare type JsRpcCompatibleValue = string | number | boolean | null | Uint8Array | JsRpcCompatibleArray | JsRpcCompatibleDictionary;
/** An array of JsRpcCompatibleValue */
export interface JsRpcCompatibleArray extends ReadonlyArray<JsRpcCompatibleValue> {
}
/** A string to JsRpcCompatibleValue dictionary. */
export interface JsRpcCompatibleDictionary {
    readonly [key: string]: JsRpcCompatibleValue;
}
export declare function isJsRpcCompatibleValue(value: unknown): value is JsRpcCompatibleValue;
export declare function isJsRpcCompatibleArray(value: unknown): value is JsRpcCompatibleArray;
export declare function isJsRpcCompatibleDictionary(data: unknown): data is JsRpcCompatibleDictionary;
export interface JsRpcRequest {
    readonly id: number;
    readonly method: string;
    readonly params: JsRpcCompatibleArray | JsRpcCompatibleDictionary;
}
export interface JsRpcSuccessResponse {
    readonly id: number;
    readonly result: any;
}
export interface JsRpcError {
    readonly code: number;
    readonly message: string;
    readonly data?: JsRpcCompatibleValue;
}
/**
 * And error object as described in https://www.jsonrpc.org/specification#error_object
 */
export interface JsRpcErrorResponse {
    readonly id: number | null;
    readonly error: JsRpcError;
}
export declare type JsRpcResponse = JsRpcSuccessResponse | JsRpcErrorResponse;
export declare function isJsRpcErrorResponse(response: JsRpcResponse): response is JsRpcErrorResponse;
export declare const jsRpcCode: {
    parseError: number;
    invalidRequest: number;
    methodNotFound: number;
    invalidParams: number;
    internalError: number;
    serverErrorDefault: number;
};
export declare function parseJsRpcId(data: unknown): number | null;
export declare function parseJsRpcRequest(data: unknown): JsRpcRequest;
export declare function parseJsRpcErrorResponse(data: unknown): JsRpcErrorResponse | undefined;
export declare function parseJsRpcResponse(data: unknown): JsRpcSuccessResponse;
export declare class JsRpcClient {
    private readonly connection;
    constructor(connection: SimpleMessagingConnection<JsRpcRequest, JsRpcResponse>);
    run(request: JsRpcRequest): Promise<JsRpcSuccessResponse>;
}
