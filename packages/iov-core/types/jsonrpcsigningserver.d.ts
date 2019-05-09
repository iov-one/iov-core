import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SigningServerCore } from "./signingservercore";
/**
 * A transport-agnostic JSON-RPC wrapper around SigningServerCore
 */
export declare class JsonRpcSigningServer {
    private readonly core;
    constructor(core: SigningServerCore);
    /**
     * Handles a request from a possibly untrusted source.
     *
     * 1. Parse request as a JSON-RPC request
     * 2. Convert JSON-RPC request into calls to SigningServerCore
     * 3. Call SigningServerCore
     * 4. Convert result to JSON-RPC response
     */
    handleUnchecked(request: unknown): Promise<JsonRpcResponse>;
    /**
     * Handles a checked request, i.e. a request that is known to be a valid
     * JSON-RPC "Request object".
     *
     * 1. Convert JSON-RPC request into calls to SigningServerCore
     * 2. Call SigningServerCore
     * 3. Convert result to JSON-RPC response
     */
    handleChecked(request: JsonRpcRequest): Promise<JsonRpcResponse>;
    /**
     * Call this to free ressources when server is not needed anymore
     */
    shutdown(): void;
}
