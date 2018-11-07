import { ReadonlyDate } from "readonly-date";
import { FullSignature, TransactionIdBytes, UnsignedTransaction } from "@iov/bcp-types";
export declare function serializeTransaction(unsigned: UnsignedTransaction, creationTime: ReadonlyDate): Uint8Array;
export declare function transactionId(unsigned: UnsignedTransaction, creationTime: ReadonlyDate, primarySignature: FullSignature): TransactionIdBytes;
