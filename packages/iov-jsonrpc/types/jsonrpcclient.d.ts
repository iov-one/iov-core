import { Stream } from "xstream";
import { JsonRpcErrorResponse, JsonRpcRequest, JsonRpcSuccessResponse } from "./types";
export interface SimpleMessagingConnection {
    readonly responseStream: Stream<JsonRpcSuccessResponse | JsonRpcErrorResponse>;
    readonly sendRequest: (request: JsonRpcRequest) => void;
}
export declare class JsonRpcClient {
    private readonly connection;
    constructor(connection: SimpleMessagingConnection);
    run(request: JsonRpcRequest): Promise<JsonRpcSuccessResponse>;
}
