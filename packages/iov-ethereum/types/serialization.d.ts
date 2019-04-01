import { Address, Nonce, SignedTransaction, UnsignedTransaction } from "@iov/bcp";
export declare class Serialization {
    static serializeGenericTransaction(nonce: Nonce, gasPriceHex: string, gasLimitHex: string, recipient: Address, valueHex: string, data: Uint8Array, v: string, r?: Uint8Array, s?: Uint8Array): Uint8Array;
    static serializeUnsignedTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array;
    static serializeSignedTransaction(signed: SignedTransaction): Uint8Array;
    /**
     * Nonce 0 must be represented as 0x instead of 0x0 for some strange reason
     */
    private static encodeNonce;
}
