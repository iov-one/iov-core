import { JsonRpcRequest } from "@iov/jsonrpc";
export interface JsonRpcEvent {
    readonly query: string;
    readonly data: {
        readonly type: string;
        readonly value: any;
    };
}
/** Creates a JSON-RPC request with random ID */
export declare function createJsonRpcRequest(method: string, params?: {}): JsonRpcRequest;
