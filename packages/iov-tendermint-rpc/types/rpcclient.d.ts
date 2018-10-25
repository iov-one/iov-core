import { Stream } from "xstream";
import { JsonRpcEvent, JsonRpcRequest, JsonRpcResponse, JsonRpcSuccess } from "./common";
export interface RpcClient {
    readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
    readonly disconnect: () => void;
}
export interface RpcStreamingClient extends RpcClient {
    readonly listen: (request: JsonRpcRequest) => Stream<JsonRpcEvent>;
}
export declare function instanceOfRpcStreamingClient(client: RpcClient): client is RpcStreamingClient;
export declare function getWindow(): any | undefined;
export declare function inBrowser(): boolean;
export declare function getOriginConfig(): any;
export declare function hasProtocol(url: string): boolean;
export declare class HttpClient implements RpcClient {
    protected readonly url: string;
    constructor(url?: string);
    disconnect(): void;
    execute(request: JsonRpcRequest): Promise<JsonRpcSuccess>;
}
/**
 * HttpUriClient encodes the whole request as an URI to be submitted
 * as a HTTP GET request.
 *
 * This is only meant for testing or quick status/health checks
 *
 * @see https://tendermint.github.io/slate/#uri-http
 */
export declare class HttpUriClient implements RpcClient {
    protected readonly baseUrl: string;
    constructor(baseUrl?: string);
    disconnect(): void;
    execute(request: JsonRpcRequest): Promise<JsonRpcSuccess>;
}
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
