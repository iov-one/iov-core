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

export class Normalize {
  public static account(initData: ChainData): (a: codecImpl.namecoin.IWallet & Keyed) => BcpAccount {
    return (acct: codecImpl.namecoin.IWallet & Keyed): BcpAccount => {
      return {
        name: typeof acct.name === "string" ? acct.name : undefined,
        address: encodeBnsAddress(acct._id),
        balance: ensure(acct.coins).map(this.coin(initData)),
      };
    };
  }

  public static coin(initData: ChainData): (c: codecImpl.x.ICoin) => BcpCoin {
    return (coin: codecImpl.x.ICoin): BcpCoin => {
      const amount = decodeAmount(coin);
      return makeAmountToBcpCoinConverter(initData)(amount);
    };
  }

  public static swapOffer(initData: ChainData): (swap: codecImpl.escrow.Escrow & Keyed) => BcpAtomicSwap {
    return (swap: codecImpl.escrow.Escrow & Keyed): BcpAtomicSwap => {
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
        amount: ensure(swap.amount).map(this.coin(initData)),
        timeout: asNumber(swap.timeout),
        memo: swap.memo,
      };

      return {
        kind: SwapState.Open,
        data,
      };
    };
  }

  public static swapOfferFromTx(initData: ChainData): (tx: ConfirmedTransaction<SwapCounterTx>) => OpenSwap {
    return (tx: ConfirmedTransaction<SwapCounterTx>): OpenSwap => {
      const counter: SwapCounterTx = tx.transaction;
      // TODO: do we really want errors here, or just filter them out???
      if (!isHashIdentifier(counter.hashCode)) {
        throw new Error("swap not controlled by hash lock");
      }
      return {
        kind: SwapState.Open,
        data: {
          id: tx.result as SwapIdBytes,
          sender: keyToAddress(counter.signer),
          recipient: counter.recipient,
          hashlock: hashFromIdentifier(counter.hashCode),
          amount: counter.amount.map(makeAmountToBcpCoinConverter(initData)),
          timeout: counter.timeout,
          memo: counter.memo,
        },
      };
    };
  }

  // public static settleAtomicSwap(swap: OpenSwap, tx: ConfirmedTransaction<SwapClaimTx | SwapTimeoutTx>): BcpAtomicSwap {
  public static settleAtomicSwap(swap: OpenSwap, tx: SwapClaimTx | SwapTimeoutTx): BcpAtomicSwap {
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
