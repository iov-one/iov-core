import { JsonRpcRequest, JsonRpcResponse } from "./types";
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
