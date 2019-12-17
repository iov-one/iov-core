import { UnsignedTransaction } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import { BnsdTxMsg, Keyed, Vote } from "./types";
import { IovBech32Prefix } from "./util";
export declare function decodeVote(prefix: IovBech32Prefix, vote: codecImpl.gov.IVote & Keyed): Vote;
export declare function decodeMsg(base: UnsignedTransaction, tx: BnsdTxMsg): UnsignedTransaction;
