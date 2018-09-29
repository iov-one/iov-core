import {
  Address,
  BcpAccount,
  BcpAtomicSwap,
  BcpCoin,
  BcpNonce,
  BcpTicker,
  ConfirmedTransaction,
  Nonce,
  OpenSwap,
  SwapCounterTx,
  SwapData,
  SwapIdBytes,
  SwapState,
  TokenTicker,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { ChainId } from "@iov/tendermint-types";

import * as codecImpl from "./codecimpl";
import { asLong, asNumber, decodePubKey, decodeToken, ensure, fungibleToBcpCoin, Keyed } from "./types";
import { hashFromIdentifier, isHashIdentifier, keyToAddress } from "./util";

// InitData is all the queries we do on initialization to be
// reused by later calls
export interface InitData {
  readonly chainId: ChainId;
  readonly tickers: Map<string, BcpTicker>;
}

export class Normalize {
  public static token(data: codecImpl.namecoin.IToken & Keyed): BcpTicker {
    return {
      tokenTicker: Encoding.fromAscii(data._id) as TokenTicker,
      tokenName: ensure(data.name),
      sigFigs: ensure(data.sigFigs),
    };
  }

  public static nonce(acct: codecImpl.sigs.IUserData & Keyed): BcpNonce {
    // append the chainID to the name to universalize it
    return {
      address: acct._id as Address,
      nonce: asLong(acct.sequence) as Nonce,
      publicKey: decodePubKey(ensure(acct.pubKey)),
    };
  }

  public static account(initData: InitData): (a: codecImpl.namecoin.IWallet & Keyed) => BcpAccount {
    return (acct: codecImpl.namecoin.IWallet & Keyed): BcpAccount => {
      return {
        name: typeof acct.name === "string" ? acct.name : undefined,
        address: acct._id as Address,
        balance: ensure(acct.coins).map(this.coin(initData)),
      };
    };
  }

  public static coin(initData: InitData): (c: codecImpl.x.ICoin) => BcpCoin {
    return (coin: codecImpl.x.ICoin): BcpCoin => {
      const token = decodeToken(coin);
      return fungibleToBcpCoin(initData)(token);
    };
  }

  public static swapOffer(initData: InitData): (swap: codecImpl.escrow.Escrow & Keyed) => BcpAtomicSwap {
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
        sender: ensure(swap.sender) as Address,
        recipient: ensure(swap.recipient) as Address,
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

  public static swapOfferFromTx(initData: InitData): (tx: ConfirmedTransaction<SwapCounterTx>) => OpenSwap {
    return (tx: ConfirmedTransaction<SwapCounterTx>): OpenSwap => {
      const counter: SwapCounterTx = tx.transaction;
      const data: SwapData = {
        id: tx.result as SwapIdBytes,
        sender: keyToAddress(counter.signer),
        recipient: counter.recipient,
        hashlock: counter.hashCode,
        amount: counter.amount.map(fungibleToBcpCoin(initData)),
        timeout: counter.timeout,
      };

      return {
        kind: SwapState.OPEN,
        data,
      };
    };
  }

  // TODO: map swapoffertx to BcpAtomicSwap
  // TODO: reducer that takes various swap tx and create an array of BcpAtomicSwap
}
