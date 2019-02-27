import { Address, BcpCoin, BcpTicker, ChainId, ConfirmedTransaction, OpenSwap, SwapOfferTransaction } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import { Keyed } from "./types";
/**
 * All the queries of immutable data we do on initialization to be reused by later calls
 *
 * This type is package internal and may change at any time.
 */
export interface ChainData {
    readonly chainId: ChainId;
    readonly tickers: Map<string, BcpTicker>;
}
/** Like BCP's Account but with no pubkey. Keep compatible to Account! */
export interface WalletData {
    readonly address: Address;
    readonly balance: ReadonlyArray<BcpCoin>;
}
export declare class Context {
    private readonly chainData;
    constructor(chainData: ChainData);
    wallet(acct: codecImpl.namecoin.IWallet & Keyed): WalletData;
    coin(coin: codecImpl.x.ICoin): BcpCoin;
    /** Decode within a Context to have the chain ID available */
    decodeOpenSwap(swap: codecImpl.escrow.Escrow & Keyed): OpenSwap;
    swapOfferFromTx(confirmed: ConfirmedTransaction<SwapOfferTransaction>): OpenSwap;
    private amountToCoin;
}
