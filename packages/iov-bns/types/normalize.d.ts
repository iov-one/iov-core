import { ChainId } from "@iov/base-types";
import { BcpAccount, BcpAtomicSwap, BcpCoin, BcpTicker, ConfirmedTransaction, OpenSwap, SwapClaimTx, SwapCounterTx, SwapTimeoutTx } from "@iov/bcp-types";
import * as codecImpl from "./generated/codecimpl";
import { Keyed } from "./types";
export interface InitData {
    readonly chainId: ChainId;
    readonly tickers: Map<string, BcpTicker>;
}
export declare class Normalize {
    static account(initData: InitData): (a: codecImpl.namecoin.IWallet & Keyed) => BcpAccount;
    static coin(initData: InitData): (c: codecImpl.x.ICoin) => BcpCoin;
    static swapOffer(initData: InitData): (swap: codecImpl.escrow.Escrow & Keyed) => BcpAtomicSwap;
    static swapOfferFromTx(initData: InitData): (tx: ConfirmedTransaction<SwapCounterTx>) => OpenSwap;
    static settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTx | SwapTimeoutTx): BcpAtomicSwap;
}
