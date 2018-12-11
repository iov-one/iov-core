import { ChainId } from "@iov/base-types";
import { BcpAccount, BcpAtomicSwap, BcpCoin, BcpTicker, ConfirmedTransaction, OpenSwap } from "@iov/bcp-types";
import * as codecImpl from "./generated/codecimpl";
import { Keyed, SwapClaimTx, SwapCounterTx, SwapTimeoutTx } from "./types";
/**
 * All the queries of immutable data we do on initialization to be reused by later calls
 *
 * This type is package internal and may change at any time.
 */
export interface ChainData {
    readonly chainId: ChainId;
    readonly tickers: Map<string, BcpTicker>;
}
export declare class Context {
    private readonly chainData;
    constructor(chainData: ChainData);
    account(acct: codecImpl.namecoin.IWallet & Keyed): BcpAccount;
    coin(coin: codecImpl.x.ICoin): BcpCoin;
    swapOffer(swap: codecImpl.escrow.Escrow & Keyed): BcpAtomicSwap;
    swapOfferFromTx(tx: ConfirmedTransaction<SwapCounterTx>): OpenSwap;
    settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTx | SwapTimeoutTx): BcpAtomicSwap;
    private amountToCoin;
}
