import { ReadonlyDate } from "readonly-date";
import { FullSignature, TransactionIdBytes, UnsignedTransaction } from "@iov/bcp-types";
import { Uint64 } from "@iov/encoding";
export interface TransactionSerializationOptions {
    readonly maxMemoLength: number;
}
export declare class Serialization {
    static toTimestamp(date: ReadonlyDate): number;
    static amountFromComponents(whole: number, fractional: number): Uint64;
    static serializeTransaction(unsigned: UnsignedTransaction, creationTime: ReadonlyDate, options: TransactionSerializationOptions): Uint8Array;
    static transactionId(unsigned: UnsignedTransaction, creationTime: ReadonlyDate, primarySignature: FullSignature, options: TransactionSerializationOptions): TransactionIdBytes;
}
