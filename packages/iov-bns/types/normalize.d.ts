import { BcpAccount, BcpCoin, BcpNonce, BcpTicker } from "@iov/bcp-types";
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
}
