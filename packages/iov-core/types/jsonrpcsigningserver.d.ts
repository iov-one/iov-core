import { JsonCompatibleValue } from "@iov/jsonrpc";
export declare class JsonRpcSigningServer {
    /**
     * Encodes a non-recursive JavaScript object as JSON in a way that is
     * 1. compact for binary data
     * 2. supports serializing/deserializing non-JSON types like Uint8Array
     */
    static toJson(data: unknown): JsonCompatibleValue;
    static fromJson(data: JsonCompatibleValue): any;
}
