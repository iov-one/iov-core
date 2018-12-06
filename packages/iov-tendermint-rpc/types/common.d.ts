import { As } from "type-tagger";
/**
 * A raw tendermint transaction hash, currently 20 bytes
 */
export declare type TxHash = Uint8Array & As<"tx-hash">;
export declare type RpcId = string & As<"rpcid">;
export declare const rpcVersion = "2.0";
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
export declare const jsonRpc: () => JsonRpc;
export declare const jsonRpcWith: (method: string, params?: {} | undefined) => JsonRpcRequest;
export declare const throwIfError: (resp: JsonRpcResponse) => JsonRpcSuccess;
export declare const ifError: (resp: JsonRpcResponse) => Error | undefined;
export declare const randomChar: () => string;
export declare const randomId: () => RpcId;
