import { Nonce, UnsignedTransaction } from "@iov/bcp-types";
export declare class Serialization {
    static serializeTransaction(unsigned: UnsignedTransaction, nonce: Nonce): Uint8Array;
}
