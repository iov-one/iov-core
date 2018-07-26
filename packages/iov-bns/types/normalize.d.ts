import { ChainId } from "@iov/tendermint-types";
import { BcpAccount, BcpCoin, BcpNonce, BcpTicker } from "@iov/types";
import * as models from "./codec";
import { Keyed } from "./types";
export interface InitData {
    readonly chainId: ChainId;
    readonly tickers: Map<string, BcpTicker>;
}
export declare class Normalize {
    static token(data: models.namecoin.IToken & Keyed): BcpTicker;
    static nonce(acct: models.sigs.IUserData & Keyed): BcpNonce;
    static account(initData: InitData): (a: models.namecoin.IWallet & Keyed) => BcpAccount;
    static coin(initData: InitData): (c: models.x.ICoin) => BcpCoin;
}
