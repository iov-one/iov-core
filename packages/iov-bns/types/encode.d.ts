import { SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import * as codecImpl from "./codecimpl";
export declare const buildSignedTx: (tx: SignedTransaction) => codecImpl.app.ITx;
export declare const buildUnsignedTx: (tx: UnsignedTransaction) => codecImpl.app.ITx;
export declare const buildMsg: (tx: UnsignedTransaction) => codecImpl.app.ITx;
