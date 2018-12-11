import { Stream } from "xstream";
import { JsonRpcEvent, JsonRpcRequest, JsonRpcResponse, JsonRpcSuccess } from "../jsonrpc";
import { RpcStreamingClient } from "./rpcclient";
export declare class WebsocketClient implements RpcStreamingClient {
    private readonly bridge;
    private readonly url;
    private readonly socket;
    constructor(baseUrl?: string, onError?: (err: any) => void);
    execute(request: JsonRpcRequest): Promise<JsonRpcSuccess>;
    listen(request: JsonRpcRequest): Stream<JsonRpcEvent>;
    disconnect(): void;
    protected responseForRequestId(id: string): Promise<JsonRpcResponse>;
}
