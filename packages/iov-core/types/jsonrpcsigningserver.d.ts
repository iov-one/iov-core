import { JsonCompatibleValue, JsonRpcRequest, JsonRpcResponse } from "@iov/jsonrpc";
import { SigningServerCore } from "./signingservercore";
/**
 * A transport-agnostic JSON-RPC wrapper around SigningServerCore
 */
export declare class JsonRpcSigningServer {
    /**
     * Encodes a non-recursive JavaScript object as JSON in a way that is
     * 1. compact for binary data
     * 2. supports serializing/deserializing non-JSON types like Uint8Array
     */
    static toJson(data: unknown): JsonCompatibleValue;
    static fromJson(data: JsonCompatibleValue): any;
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
