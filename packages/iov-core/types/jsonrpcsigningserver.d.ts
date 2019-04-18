import { JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SigningServerCore } from "./signingservercore";
/**
 * A transport-agnostic JSON-RPC wrapper around SigningServerCore
 */
export declare class JsonRpcSigningServer {
    private readonly core;
    constructor(core: SigningServerCore);
    handleUnchecked(request: unknown): Promise<JsonRpcResponse>;
    /**
     * Handles a checked JsonRpcRequest
     *
     * 1. convert JsRpcRequest into calls to SigningServerCore
     * 2. call SigningServerCore
     * 3. convert result to JSON-RPC format
     */
    handleChecked(request: JsonRpcRequest): Promise<JsonRpcResponse>;
    /**
     * Call this to free ressources when server is not needed anymore
     */
    shutdown(): void;
}
