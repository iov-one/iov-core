import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { JsonRpcClient } from "./jsonrpcclient";
export declare class HttpJsonRpcClient extends JsonRpcClient {
    private readonly baseUrl;
    constructor(baseUrl: string);
    run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}
