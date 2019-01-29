import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
export declare class HttpJsonRpcClient {
    private readonly baseUrl;
    constructor(baseUrl: string);
    run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}
