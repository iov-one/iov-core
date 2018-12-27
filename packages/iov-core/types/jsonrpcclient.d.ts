export interface JsonRpcRequest {
    readonly jsonrpc: "2.0";
    readonly id: number;
    readonly method: string;
    readonly params: ReadonlyArray<any>;
}
export interface JsonRpcResponse {
    readonly jsonrpc: "2.0";
    readonly id: number;
    readonly result: any;
}
export declare const jsonRpcCodeParseError = -32700;
export declare const jsonRpcCodeInvalidRequest = -32600;
export declare const jsonRpcCodeMethodNotFound = -32601;
export declare const jsonRpcCodeInvalidParams = -32602;
export declare const jsonRpcCodeInternalError = -32603;
export declare const jsonRpcCodeServerErrorDefault = -32000;
/**
 * And error object as described in https://www.jsonrpc.org/specification#error_object
 */
export interface JsonRpcErrorResponse {
    readonly jsonrpc: "2.0";
    readonly id: number | null;
    readonly error: {
        readonly code: number;
        readonly message: string;
        readonly data?: any;
    };
}
interface SimpleMessagingConnection {
    onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
    readonly postMessage: (message: any, transfer?: Transferable[]) => void;
}
export declare class JsonRpcClient {
    private readonly responseStream;
    private readonly connection;
    constructor(connection: SimpleMessagingConnection);
    run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}
export {};
