import { As } from "type-tagger";
export declare type RpcId = string & As<"rpcid">;
export interface JsonRpc {
    readonly jsonrpc: "2.0";
    readonly id: RpcId;
}
export interface JsonRpcRequest extends JsonRpc {
    readonly method: string;
    readonly params: {};
}
export declare type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;
export interface JsonRpcSuccess extends JsonRpc {
    readonly result: any;
}
export interface JsonRpcError extends JsonRpc {
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
export declare function jsonRpc(): JsonRpc;
export declare function jsonRpcWith(method: string, params?: {}): JsonRpcRequest;
export declare function throwIfError(resp: JsonRpcResponse): JsonRpcSuccess;
export declare function ifError(resp: JsonRpcResponse): Error | undefined;
/** generates a random alphanumeric character  */
export declare function randomChar(): string;
export declare function randomId(): RpcId;
