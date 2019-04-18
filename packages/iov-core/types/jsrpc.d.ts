import { SimpleMessagingConnection } from "@iov/jsonrpc";
/**
 * A single structured clone algorithm compatible value
 *
 * @deprecated use JsonRpcSigningServer and friends
 */
export declare type JsRpcCompatibleValue = string | number | boolean | null | Uint8Array | JsRpcCompatibleArray | JsRpcCompatibleDictionary;
/**
 * An array of JsRpcCompatibleValue
 *
 * @deprecated use JsonRpcSigningServer and friends
 */
export interface JsRpcCompatibleArray extends ReadonlyArray<JsRpcCompatibleValue> {
}
/**
 * A string to JsRpcCompatibleValue dictionary.
 *
 * @deprecated use JsonRpcSigningServer and friends
 */
export interface JsRpcCompatibleDictionary {
    readonly [key: string]: JsRpcCompatibleValue;
}
/** @deprecated use JsonRpcSigningServer and friends */
export declare function isJsRpcCompatibleValue(value: unknown): value is JsRpcCompatibleValue;
/** @deprecated use JsonRpcSigningServer and friends */
export declare function isJsRpcCompatibleArray(value: unknown): value is JsRpcCompatibleArray;
/** @deprecated use JsonRpcSigningServer and friends */
export declare function isJsRpcCompatibleDictionary(data: unknown): data is JsRpcCompatibleDictionary;
/** @deprecated use JsonRpcSigningServer and friends */
export interface JsRpcRequest {
    readonly id: number;
    readonly method: string;
    readonly params: JsRpcCompatibleArray | JsRpcCompatibleDictionary;
}
/** @deprecated use JsonRpcSigningServer and friends */
export interface JsRpcSuccessResponse {
    readonly id: number;
    readonly result: any;
}
/** @deprecated use JsonRpcSigningServer and friends */
export interface JsRpcError {
    readonly code: number;
    readonly message: string;
    readonly data?: JsRpcCompatibleValue;
}
/**
 * And error object as described in https://www.jsonrpc.org/specification#error_object
 *
 * @deprecated use JsonRpcSigningServer and friends
 */
export interface JsRpcErrorResponse {
    readonly id: number | null;
    readonly error: JsRpcError;
}
/** @deprecated use JsonRpcSigningServer and friends */
export declare type JsRpcResponse = JsRpcSuccessResponse | JsRpcErrorResponse;
/** @deprecated use JsonRpcSigningServer and friends */
export declare function isJsRpcErrorResponse(response: JsRpcResponse): response is JsRpcErrorResponse;
/** @deprecated use JsonRpcSigningServer and friends */
export declare const jsRpcCode: {
    parseError: number;
    invalidRequest: number;
    methodNotFound: number;
    invalidParams: number;
    internalError: number;
    serverErrorDefault: number;
};
/** @deprecated use JsonRpcSigningServer and friends */
export declare function parseJsRpcId(data: unknown): number | null;
/** @deprecated use JsonRpcSigningServer and friends */
export declare function parseJsRpcRequest(data: unknown): JsRpcRequest;
/** @deprecated use JsonRpcSigningServer and friends */
export declare function parseJsRpcErrorResponse(data: unknown): JsRpcErrorResponse | undefined;
/** @deprecated use JsonRpcSigningServer and friends */
export declare function parseJsRpcResponse(data: unknown): JsRpcSuccessResponse;
/** @deprecated use JsonRpcSigningServer and friends */
export declare class JsRpcClient {
    private readonly connection;
    constructor(connection: SimpleMessagingConnection<JsRpcRequest, JsRpcResponse>);
    run(request: JsRpcRequest): Promise<JsRpcSuccessResponse>;
}
