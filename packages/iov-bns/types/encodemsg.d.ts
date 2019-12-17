import { UnsignedTransaction } from "@iov/bcp";
import { BnsdTxMsg } from "./types";
export declare function encodeMsg(tx: UnsignedTransaction, strictMode?: boolean): BnsdTxMsg;
