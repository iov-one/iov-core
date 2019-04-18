import { JsRpcRequest, JsRpcResponse } from "./jsrpc";
import { SigningServerCore } from "./signingservercore";
/**
 * A transport-agnostic JavaScript RPC wrapper around SigningServerCore
 *
 * @deprecated use JsonRpcSigningServer and friends
 */
export declare class JsRpcSigningServer {
    private readonly core;
    constructor(core: SigningServerCore);
    handleUnchecked(request: unknown): Promise<JsRpcResponse>;
    /**
     * Handles a checked JsRpcRequest
     *
     * 1. convert JsRpcRequest into calls to SigningServerCore
     * 2. call SigningServerCore
     * 3. convert result to JS RPC format
     */
    handleChecked(request: JsRpcRequest): Promise<JsRpcResponse>;
    /**
     * Call this to free ressources when server is not needed anymore
     */
    shutdown(): void;
}
