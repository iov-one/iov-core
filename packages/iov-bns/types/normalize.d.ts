import { BcpAccount, BcpAtomicSwap, BcpCoin, BcpNonce, BcpTicker, ConfirmedTransaction, OpenSwap, SwapCounterTx } from "@iov/bcp-types";
import { ChainId } from "@iov/tendermint-types";
import * as codecImpl from "./codecimpl";
import { Keyed } from "./types";
export interface InitData {
    readonly chainId: ChainId;
    readonly tickers: Map<string, BcpTicker>;
}
export declare class Normalize {
    static token(data: codecImpl.namecoin.IToken & Keyed): BcpTicker;
    static nonce(acct: codecImpl.sigs.IUserData & Keyed): BcpNonce;
    static account(initData: InitData): (a: codecImpl.namecoin.IWallet & Keyed) => BcpAccount;
    static coin(initData: InitData): (c: codecImpl.x.ICoin) => BcpCoin;
    static swapOffer(initData: InitData): (swap: codecImpl.escrow.Escrow & Keyed) => BcpAtomicSwap;
    static swapOfferFromTx(initData: InitData): (tx: ConfirmedTransaction<SwapCounterTx>) => OpenSwap;
}
