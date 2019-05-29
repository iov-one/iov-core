import { Stream } from "xstream";
import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SocketWrapperMessageEvent } from "@iov/socket";
import { JsonRpcClient } from "./jsonrpcclient";
export declare class WsJsonRpcClient implements JsonRpcClient {
    readonly events: Stream<SocketWrapperMessageEvent>;
    private readonly socket;
    constructor(baseUrl: string);
    run(request: JsonRpcRequest): Promise<JsonRpcResponse>;
    socketSend(request: JsonRpcRequest, ignoreNetworkError?: boolean): Promise<void>;
    disconnect(): void;
}
