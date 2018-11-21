import { ChainId } from "@iov/base-types";
import { Amount, BaseTx, SignedTransaction, UnsignedTransaction } from "@iov/bcp-types";
import * as codecImpl from "./generated/codecimpl";
import { BnsBlockchainNft, BnsUsernameNft } from "./types";
export declare function decodeBlockchainNft(nft: codecImpl.blockchain.IBlockchainToken): BnsBlockchainNft;
export declare function decodeUsernameNft(nft: codecImpl.username.IUsernameToken): BnsUsernameNft;
export declare function decodeAmount(coin: codecImpl.x.ICoin): Amount;
export declare function parseTx(tx: codecImpl.app.ITx, chainId: ChainId): SignedTransaction;
export declare function parseMsg(base: BaseTx, tx: codecImpl.app.ITx): UnsignedTransaction;
