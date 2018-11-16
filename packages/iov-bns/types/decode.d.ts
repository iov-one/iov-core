import { ChainId } from "@iov/base-types";
import { Amount, BaseTx, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import * as codecImpl from "./generated/codecimpl";
export declare function decodeAmount(coin: codecImpl.x.ICoin): Amount;
export declare function parseTx(tx: codecImpl.app.ITx, chainId: ChainId): SignedTransaction;
export declare function parseMsg(base: BaseTx, tx: codecImpl.app.ITx): UnsignedTransaction;
