import { ChainId } from "@iov/tendermint-types";
import { BaseTx, SignedTransaction, UnsignedTransaction } from "@iov/types";
import * as codec from "./codec";
export declare const parseTx: (tx: codec.app.ITx, chainId: ChainId) => SignedTransaction;
export declare const parseMsg: (base: BaseTx, tx: codec.app.ITx) => UnsignedTransaction;
