import { Nonce, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
export declare class Serialization {
    static serializeUnsignedTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array;
    static serializeSignedTransaction(signed: SignedTransaction): Uint8Array;
    /**
     * Nonce 0 must be represented as 0x instead of 0x0 for some strange reason
     */
    private static encodeNonce;
}
