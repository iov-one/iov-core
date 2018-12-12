import { Stream } from "xstream";
import { JsonRpcEvent, JsonRpcRequest, JsonRpcResponse, JsonRpcSuccess } from "../jsonrpc";
import { RpcStreamingClient } from "./rpcclient";
export declare class WebsocketClient implements RpcStreamingClient {
    private readonly url;
    private readonly socket;
    /** Same events as in socket.events but in the format we need */
    private readonly jsonRpcResponseStream;
    private readonly subscriptionStreams;
    constructor(baseUrl?: string, onError?: (err: any) => void);
    execute(request: JsonRpcRequest): Promise<JsonRpcSuccess>;
    listen(request: JsonRpcRequest): Stream<JsonRpcEvent>;
    /**
     * Resolves as soon as websocket is connected. execute() queues requests automatically,
     * so this should be required for testing purposes only.
     */
    connected(): Promise<void>;
    disconnect(): void;
    protected responseForRequestId(id: string): Promise<JsonRpcResponse>;
}
