import { JsonRpcRequest, JsonRpcSuccess } from "../jsonrpc";
import { RpcClient } from "./rpcclient";
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
