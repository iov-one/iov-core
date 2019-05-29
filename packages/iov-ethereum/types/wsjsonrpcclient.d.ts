import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { StreamingSocket } from "@iov/socket";
import { JsonRpcClient } from "./jsonrpcclient";
export declare class WsJsonRpcClient extends JsonRpcClient {
    private readonly socket;
    constructor(socket: StreamingSocket);
    run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
}
