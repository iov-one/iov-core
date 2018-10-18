import { ReadonlyDate } from "readonly-date";
import { FullSignature, TransactionIdBytes, UnsignedTransaction } from "@iov/bcp-types";
import { Uint64 } from "@iov/encoding";
export declare function toLiskTimestamp(date: ReadonlyDate): number;
export declare function amountFromComponents(whole: number, fractional: number): Uint64;
export declare function serializeTransaction(unsigned: UnsignedTransaction, creationTime: ReadonlyDate): Uint8Array;
export declare function transactionId(unsigned: UnsignedTransaction, creationTime: ReadonlyDate, primarySignature: FullSignature): TransactionIdBytes;
