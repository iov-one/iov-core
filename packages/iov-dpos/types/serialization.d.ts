import { ReadonlyDate } from "readonly-date";
import { FullSignature, TransactionIdBytes, UnsignedTransaction } from "@iov/bcp-types";
export interface TransactionSerializationOptions {
    readonly maxMemoLength: number;
}
export declare class Serialization {
    static toTimestamp(date: ReadonlyDate): number;
    static serializeTransaction(unsigned: UnsignedTransaction, creationTime: ReadonlyDate, options: TransactionSerializationOptions): Uint8Array;
    static transactionId(unsigned: UnsignedTransaction, creationTime: ReadonlyDate, primarySignature: FullSignature, options: TransactionSerializationOptions): TransactionIdBytes;
}
