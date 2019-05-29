import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { JsonRpcClient } from "./jsonrpcclient";
export declare class HttpJsonRpcClient implements JsonRpcClient {
    readonly events: import("xstream").Stream<any>;
    private readonly baseUrl;
    constructor(baseUrl: string);
    run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
    socketSend(): Promise<void>;
    disconnect(): void;
}
