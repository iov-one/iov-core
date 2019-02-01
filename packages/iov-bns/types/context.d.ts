import { Address, AtomicSwap, BcpCoin, BcpTicker, ChainId, ConfirmedTransaction, OpenSwap, SwapCounterTransaction } from "@iov/bcp-types";
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
    swapOffer(swap: codecImpl.escrow.Escrow & Keyed): AtomicSwap;
    swapOfferFromTx(tx: ConfirmedTransaction<SwapCounterTransaction>): OpenSwap;
    private amountToCoin;
}
