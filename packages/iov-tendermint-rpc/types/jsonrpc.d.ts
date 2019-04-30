import { JsonRpcRequest, JsonRpcResponse, JsonRpcSuccessResponse } from "@iov/jsonrpc";
export interface JsonRpcEvent {
    readonly query: string;
    readonly data: {
        readonly type: string;
        readonly value: any;
    };
}
export declare function jsonRpcWith(method: string, params?: {}): JsonRpcRequest;
export declare function throwIfError(resp: JsonRpcResponse): JsonRpcSuccessResponse;
/** generates a random alphanumeric character  */
export declare function randomChar(): string;
export declare function randomId(): string;
