import { ChainId } from "@iov/base-types";
import { BcpAccount, BcpAtomicSwap, BcpCoin, BcpTicker, ConfirmedTransaction, OpenSwap, SwapClaimTx, SwapCounterTx, SwapTimeoutTx } from "@iov/bcp-types";
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
export declare class Normalize {
    static account(initData: ChainData): (a: codecImpl.namecoin.IWallet & Keyed) => BcpAccount;
    static coin(initData: ChainData): (c: codecImpl.x.ICoin) => BcpCoin;
    static swapOffer(initData: ChainData): (swap: codecImpl.escrow.Escrow & Keyed) => BcpAtomicSwap;
    static swapOfferFromTx(initData: ChainData): (tx: ConfirmedTransaction<SwapCounterTx>) => OpenSwap;
    static settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTx | SwapTimeoutTx): BcpAtomicSwap;
}
