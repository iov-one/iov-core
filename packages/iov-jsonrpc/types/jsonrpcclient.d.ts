import { Stream } from "xstream";
import { JsonRpcRequest, JsonRpcResponse, JsonRpcSuccessResponse } from "./types";
export interface SimpleMessagingConnection<Request, Response> {
    readonly responseStream: Stream<Response>;
    readonly sendRequest: (request: Request) => void;
}
export declare class JsonRpcClient {
    private readonly connection;
    constructor(connection: SimpleMessagingConnection<JsonRpcRequest, JsonRpcResponse>);
    run(request: JsonRpcRequest): Promise<JsonRpcSuccessResponse>;
}
