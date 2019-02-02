import {
  Address,
  Amount,
  BcpCoin,
  BcpTicker,
  ChainId,
  ConfirmedTransaction,
  OpenSwap,
  SwapCounterTransaction,
  SwapIdBytes,
  SwapState,
} from "@iov/bcp-types";

import { decodeAmount } from "./decode";
import * as codecImpl from "./generated/codecimpl";
import { asNumber, ensure, Keyed } from "./types";
import {
  addressPrefix,
  encodeBnsAddress,
  hashFromIdentifier,
  identityToAddress,
  isHashIdentifier,
} from "./util";

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

export class Context {
  private readonly chainData: ChainData;

  constructor(chainData: ChainData) {
    this.chainData = chainData;
  }

  public wallet(acct: codecImpl.namecoin.IWallet & Keyed): WalletData {
    // acct.name is ignored in favour of username NFTs
    return {
      address: encodeBnsAddress(addressPrefix(this.chainData.chainId), acct._id),
      balance: ensure(acct.coins).map(c => this.coin(c)),
    };
  }

  public coin(coin: codecImpl.x.ICoin): BcpCoin {
    const amount = decodeAmount(coin);
    return this.amountToCoin(amount);
  }

  /** Decode within a Context to have the chain ID available */
  public decodeOpenSwap(swap: codecImpl.escrow.Escrow & Keyed): OpenSwap {
    if (!isHashIdentifier(swap.arbiter)) {
      throw new Error("Escrow not controlled by hashlock");
    }
    const hash = hashFromIdentifier(swap.arbiter);

    return {
      kind: SwapState.Open,
      data: {
        id: swap._id as SwapIdBytes,
        sender: encodeBnsAddress(addressPrefix(this.chainData.chainId), ensure(swap.sender)),
        recipient: encodeBnsAddress(addressPrefix(this.chainData.chainId), ensure(swap.recipient)),
        hashlock: hash,
        amounts: ensure(swap.amount).map(coin => decodeAmount(coin)),
        timeout: asNumber(swap.timeout),
        memo: swap.memo,
      },
    };
  }

  public swapOfferFromTx(tx: ConfirmedTransaction<SwapCounterTransaction>): OpenSwap {
    const counterTransaction: SwapCounterTransaction = tx.transaction;
    return {
      kind: SwapState.Open,
      data: {
        id: tx.result as SwapIdBytes,
        sender: identityToAddress(counterTransaction.creator),
        recipient: counterTransaction.recipient,
        hashlock: counterTransaction.hashCode,
        amounts: counterTransaction.amounts,
        timeout: counterTransaction.timeout,
        memo: counterTransaction.memo,
      },
    };
  }

  private amountToCoin(amount: Amount): BcpCoin {
    const tickerInfo = this.chainData.tickers.get(amount.tokenTicker);
    return {
      ...amount,
      // Better defaults?
      tokenName: tickerInfo ? tickerInfo.tokenName : "<Unknown token>",
    };
  }
}
