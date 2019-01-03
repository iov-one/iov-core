import { Stream } from "xstream";
import { JsonRpcRequest, JsonRpcResponse, JsonRpcSuccessResponse } from "./types";
export interface SimpleMessagingConnection {
    readonly responseStream: Stream<JsonRpcResponse>;
    readonly sendRequest: (request: JsonRpcRequest) => void;
}
export declare class JsonRpcClient {
    private readonly connection;
    constructor(connection: SimpleMessagingConnection);
    run(request: JsonRpcRequest): Promise<JsonRpcSuccessResponse>;
}
