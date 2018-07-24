import { SignedTransaction, UnsignedTransaction } from "@iov/types";
import * as codec from "./codec";
export declare const buildSignedTx: (tx: SignedTransaction) => codec.app.ITx;
export declare const buildUnsignedTx: (tx: UnsignedTransaction) => codec.app.ITx;
export declare const buildMsg: (tx: UnsignedTransaction) => codec.app.ITx;
