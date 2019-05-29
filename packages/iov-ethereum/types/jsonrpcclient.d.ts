import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
export declare abstract class JsonRpcClient {
    abstract run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}
