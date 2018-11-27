import { ChainId } from "@iov/base-types";
import {
  Amount,
  BcpAccount,
  BcpAtomicSwap,
  BcpCoin,
  BcpTicker,
  ConfirmedTransaction,
  OpenSwap,
  SwapClaimTx,
  SwapCounterTx,
  SwapData,
  SwapIdBytes,
  SwapState,
  SwapTimeoutTx,
  TransactionKind,
} from "@iov/bcp-types";

import { decodeAmount } from "./decode";
import * as codecImpl from "./generated/codecimpl";
import { asNumber, ensure, Keyed } from "./types";
import { encodeBnsAddress, hashFromIdentifier, isHashIdentifier, keyToAddress } from "./util";

function makeAmountToBcpCoinConverter(initData: ChainData): (amount: Amount) => BcpCoin {
  return (amount: Amount) => {
    const tickerInfo = initData.tickers.get(amount.tokenTicker);
    return {
      ...amount,
      // Better defaults?
      tokenName: tickerInfo ? tickerInfo.tokenName : "<Unknown token>",
      fractionalDigits: tickerInfo ? tickerInfo.fractionalDigits : 9,
    };
  };
}

/**
 * All the queries of immutable data we do on initialization to be reused by later calls
 *
 * This type is package internal and may change at any time.
 */
export interface ChainData {
  readonly chainId: ChainId;
  readonly tickers: Map<string, BcpTicker>;
}

export class Context {
  private readonly chainData: ChainData;

  constructor(chainData: ChainData) {
    this.chainData = chainData;
  }

  public account(acct: codecImpl.namecoin.IWallet & Keyed): BcpAccount {
    return {
      name: typeof acct.name === "string" ? acct.name : undefined,
      address: encodeBnsAddress(acct._id),
      balance: ensure(acct.coins).map(c => this.coin(c)),
    };
  }

  public coin(coin: codecImpl.x.ICoin): BcpCoin {
    const converter = makeAmountToBcpCoinConverter(this.chainData);
    const amount = decodeAmount(coin);
    return converter(amount);
  }

  public swapOffer(swap: codecImpl.escrow.Escrow & Keyed): BcpAtomicSwap {
    // TODO: get and check hashlock
    let hashlock: Uint8Array;
    if (isHashIdentifier(swap.arbiter)) {
      hashlock = hashFromIdentifier(swap.arbiter);
    } else {
      throw new Error("Escrow not controlled by hashlock");
    }

    const data: SwapData = {
      id: swap._id as SwapIdBytes,
      sender: encodeBnsAddress(ensure(swap.sender)),
      recipient: encodeBnsAddress(ensure(swap.recipient)),
      hashlock,
      amount: ensure(swap.amount).map(coin => this.coin(coin)),
      timeout: asNumber(swap.timeout),
      memo: swap.memo,
    };

    return {
      kind: SwapState.Open,
      data,
    };
  }

  public swapOfferFromTx(tx: ConfirmedTransaction<SwapCounterTx>): OpenSwap {
    const counter: SwapCounterTx = tx.transaction;
    // TODO: do we really want errors here, or just filter them out???
    if (!isHashIdentifier(counter.hashCode)) {
      throw new Error("swap not controlled by hash lock");
    }
    const converter = makeAmountToBcpCoinConverter(this.chainData);
    return {
      kind: SwapState.Open,
      data: {
        id: tx.result as SwapIdBytes,
        sender: keyToAddress(counter.signer),
        recipient: counter.recipient,
        hashlock: hashFromIdentifier(counter.hashCode),
        amount: counter.amount.map(converter),
        timeout: counter.timeout,
        memo: counter.memo,
      },
    };
  }

  // TODO: Not using the chain data. Does this belong here?
  public settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTx | SwapTimeoutTx): BcpAtomicSwap {
    if (tx.kind === TransactionKind.SwapClaim) {
      return {
        kind: SwapState.Claimed,
        data: swap.data,
        preimage: tx.preimage,
      };
    } else {
      return {
        kind: SwapState.Expired,
        data: swap.data,
      };
    }
  }
}
