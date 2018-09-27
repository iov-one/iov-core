import { ReadonlyDate } from "readonly-date";
import { FullSignature, TransactionIdBytes, UnsignedTransaction } from "@iov/bcp-types";
export declare function toLiskTimestamp(date: ReadonlyDate): number;
export declare function serializeTransaction(unsigned: UnsignedTransaction): Uint8Array;
export declare function transactionId(unsigned: UnsignedTransaction, primarySignature: FullSignature): TransactionIdBytes;
