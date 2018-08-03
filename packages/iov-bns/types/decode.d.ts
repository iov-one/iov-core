import { BaseTx, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import { ChainId } from "@iov/tendermint-types";
import * as codecImpl from "./codecimpl";
export declare const parseTx: (tx: codecImpl.app.ITx, chainId: ChainId) => SignedTransaction;
export declare const parseMsg: (base: BaseTx, tx: codecImpl.app.ITx) => UnsignedTransaction;
