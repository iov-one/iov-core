import { BaseTx, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import { ChainId } from "@iov/tendermint-types";
import * as codec from "./codecimpl";
export declare const parseTx: (tx: codec.app.ITx, chainId: ChainId) => SignedTransaction;
export declare const parseMsg: (base: BaseTx, tx: codec.app.ITx) => UnsignedTransaction;
