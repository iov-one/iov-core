import { Address, BcpAccount, BcpCoin, BcpNonce, BcpTicker, Nonce, TokenTicker } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { ChainId } from "@iov/tendermint-types";

import * as models from "./codecimpl";
import { asLong, decodePubKey, decodeToken, ensure, Keyed } from "./types";

// InitData is all the queries we do on initialization to be
// reused by later calls
export interface InitData {
  readonly chainId: ChainId;
  readonly tickers: Map<string, BcpTicker>;
}

export class Normalize {
  public static token(data: models.namecoin.IToken & Keyed): BcpTicker {
    return {
      tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
      tokenName: ensure(data.name),
      sigFigs: ensure(data.sigFigs),
    };
  }

  public static nonce(acct: models.sigs.IUserData & Keyed): BcpNonce {
    // append the chainID to the name to universalize it
    return {
      address: acct._id as Address,
      nonce: asLong(acct.sequence) as Nonce,
      publicKey: decodePubKey(ensure(acct.pubKey)),
    };
  }

  public static account(initData: InitData): (a: models.namecoin.IWallet & Keyed) => BcpAccount {
    return (acct: models.namecoin.IWallet & Keyed): BcpAccount => {
      // append the chainID to the name to universalize it
      const name = acct.name ? `${acct.name}*${initData.chainId}` : undefined;
      return {
        name,
        address: acct._id as Address,
        balance: ensure(acct.coins).map(this.coin(initData)),
      };
    };
  }

  public static coin(initData: InitData): (c: models.x.ICoin) => BcpCoin {
    return (coin: models.x.ICoin): BcpCoin => {
      const token = decodeToken(coin);
      const tickerInfo = initData.tickers.get(token.tokenTicker);
      return {
        ...token,
        // Better defaults?
        tokenName: tickerInfo ? tickerInfo.tokenName : "<Unknown token>",
        sigFigs: tickerInfo ? tickerInfo.sigFigs : 9,
      };
    };
  }
}
