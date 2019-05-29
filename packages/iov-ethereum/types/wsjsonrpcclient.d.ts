import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { StreamingSocket } from "@iov/socket";
export declare class WsJsonRpcClient {
    private readonly socket;
    constructor(socket: StreamingSocket);
    run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}
