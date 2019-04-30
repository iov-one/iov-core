import { JsonRpcId } from "@iov/jsonrpc";
export interface JsonRpcRequest {
    readonly jsonrpc: "2.0";
    readonly id: JsonRpcId;
    readonly method: string;
    readonly params: {};
}
export declare type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;
export interface JsonRpcSuccess {
    readonly jsonrpc: "2.0";
    readonly id: JsonRpcId;
    readonly result: any;
}
export interface JsonRpcError {
    readonly jsonrpc: "2.0";
    readonly id: JsonRpcId;
    readonly error: {
        readonly code: number;
        readonly message: string;
        readonly data?: string;
    };
}
export interface JsonRpcEvent {
    readonly query: string;
    readonly data: {
        readonly type: string;
        readonly value: any;
    };
}
export declare function jsonRpcWith(method: string, params?: {}): JsonRpcRequest;
export declare function throwIfError(resp: JsonRpcResponse): JsonRpcSuccess;
export declare function ifError(resp: JsonRpcResponse): Error | undefined;
/** generates a random alphanumeric character  */
export declare function randomChar(): string;
export declare function randomId(): string;
