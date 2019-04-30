import { JsonRpcRequest } from "@iov/jsonrpc";
export interface JsonRpcEvent {
    readonly query: string;
    readonly data: {
        readonly type: string;
        readonly value: any;
    };
}
export declare function jsonRpcWith(method: string, params?: {}): JsonRpcRequest;
/** generates a random alphanumeric character  */
export declare function randomChar(): string;
export declare function randomId(): string;
