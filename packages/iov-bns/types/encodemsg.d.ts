import { UnsignedTransaction } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
/**
 * The message part of a bnsd.Tx
 *
 * @see https://htmlpreview.github.io/?https://github.com/iov-one/weave/blob/v0.24.0/docs/proto/index.html#bnsd.Tx
 */
export declare type BnsdTxMsg = Omit<codecImpl.bnsd.ITx, "fees" | "signatures" | "multisig">;
export declare function encodeMsg(tx: UnsignedTransaction, strictMode?: boolean): BnsdTxMsg;
