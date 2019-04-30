import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SigningServerCore } from "./signingservercore";
/**
 * A transport-agnostic JSON-RPC wrapper around SigningServerCore
 */
export declare class JsonRpcSigningServer {
    private readonly core;
    constructor(core: SigningServerCore);
    /**
     * Handles a request from a possible untrusted source.
     */
    handleUnchecked(request: unknown): Promise<JsonRpcResponse>;
    /**
     * Handles a checked request, i.e. a request that is known to be a valid
     * JSON-RPC "Request object".
     *
     * 1. convert JsonRpcRequest into calls to SigningServerCore
     * 2. call SigningServerCore
     * 3. convert result to JSON-RPC format
     */
    handleChecked(request: JsonRpcRequest): Promise<JsonRpcResponse>;
    /**
     * Call this to free ressources when server is not needed anymore
     */
    shutdown(): void;
}
