import {
  Address,
  Amount,
  ChainId,
  ConfirmedTransaction,
  Hash,
  OpenSwap,
  SwapIdBytes,
  SwapOfferTransaction,
  SwapProcessState,
  WithCreator,
} from "@iov/bcp";

import { asIntegerNumber, decodeAmount, ensure } from "./decode";
import * as codecImpl from "./generated/codecimpl";
import { Keyed } from "./types";
import { addressPrefix, encodeBnsAddress, identityToAddress } from "./util";

/**
 * All the queries of immutable data we do on initialization to be reused by later calls
 *
 * This type is package internal and may change at any time.
 */
export interface ChainData {
  readonly chainId: ChainId;
}

/** Like BCP's Account but with no pubkey. Keep compatible to Account! */
export interface WalletData {
  readonly address: Address;
  readonly balance: readonly Amount[];
}

export class Context {
  private readonly chainData: ChainData;

  public constructor(chainData: ChainData) {
    this.chainData = chainData;
  }

  public wallet(acct: codecImpl.cash.ISet & Keyed): WalletData {
    return {
      address: encodeBnsAddress(addressPrefix(this.chainData.chainId), acct._id),
      balance: ensure(acct.coins).map(c => decodeAmount(c)),
    };
  }

  /** Decode within a Context to have the chain ID available */
  public decodeOpenSwap(swap: codecImpl.aswap.Swap & Keyed): OpenSwap {
    const hash = swap.preimageHash;
    if (hash.length !== 32) {
      throw new Error("Hash must be 32 bytes (sha256)");
    }

    const prefix = addressPrefix(this.chainData.chainId);
    return {
      kind: SwapProcessState.Open,
      data: {
        id: {
          data: swap._id as SwapIdBytes,
        },
        sender: encodeBnsAddress(prefix, ensure(swap.source, "source")),
        recipient: encodeBnsAddress(prefix, ensure(swap.destination, "destination")),
        hash: hash as Hash,
        // amounts: ensure(swap.amount).map(coin => decodeAmount(coin)),
        // TODO: read this is a second query
        amounts: [],
        timeout: { timestamp: asIntegerNumber(ensure(swap.timeout)) },
        memo: swap.memo,
      },
    };
  }

  public swapOfferFromTx(confirmed: ConfirmedTransaction<SwapOfferTransaction & WithCreator>): OpenSwap {
    const transaction = confirmed.transaction;
    return {
      kind: SwapProcessState.Open,
      data: {
        id: {
          data: confirmed.result as SwapIdBytes,
        },
        sender: identityToAddress(transaction.creator),
        recipient: transaction.recipient,
        hash: transaction.hash,
        amounts: transaction.amounts,
        timeout: transaction.timeout,
        memo: transaction.memo,
      },
    };
  }
}
