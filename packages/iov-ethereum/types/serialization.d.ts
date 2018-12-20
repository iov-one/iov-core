import { Nonce, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
export declare class Serialization {
    static serializeUnsignedTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array;
    static serializeSignedTransaction(signed: SignedTransaction): Uint8Array;
}
