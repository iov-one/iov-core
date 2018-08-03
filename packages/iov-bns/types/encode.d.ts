import { SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import * as codec from "./codecimpl";
export declare const buildSignedTx: (tx: SignedTransaction) => codec.app.ITx;
export declare const buildUnsignedTx: (tx: UnsignedTransaction) => codec.app.ITx;
export declare const buildMsg: (tx: UnsignedTransaction) => codec.app.ITx;
