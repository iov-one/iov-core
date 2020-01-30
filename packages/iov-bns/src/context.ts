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
} from "@iov/bcp";

import { decodeAmount } from "./decodeobjects";
import { asIntegerNumber, ensure } from "./decodinghelpers";
import * as codecImpl from "./generated/codecimpl";
import { Keyed } from "./types";
import { addressPrefix, encodeBnsAddress } from "./util";

/** Like BCP's Account but with no pubkey. Keep compatible to Account! */
export interface WalletData {
  readonly address: Address;
  readonly balance: readonly Amount[];
}

export class Context {
  private readonly chainId: ChainId;

  public constructor(chainId: ChainId) {
    this.chainId = chainId;
  }

  public wallet(acct: codecImpl.cash.ISet & Keyed): WalletData {
    return {
      address: encodeBnsAddress(addressPrefix(this.chainId), acct._id),
      balance: ensure(acct.coins).map(c => decodeAmount(c)),
    };
  }

  /** Decode within a Context to have the chain ID available */
  public decodeOpenSwap(swap: codecImpl.aswap.Swap & Keyed): OpenSwap {
    const hash = swap.preimageHash;
    if (hash.length !== 32) {
      throw new Error("Hash must be 32 bytes (sha256)");
    }

    const prefix = addressPrefix(this.chainId);
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

  public swapOfferFromTx(confirmed: ConfirmedTransaction<SwapOfferTransaction>): OpenSwap {
    const transaction = confirmed.transaction;
    return {
      kind: SwapProcessState.Open,
      data: {
        id: {
          data: confirmed.result as SwapIdBytes,
        },
        sender: transaction.sender,
        recipient: transaction.recipient,
        hash: transaction.hash,
        amounts: transaction.amounts,
        timeout: transaction.timeout,
        memo: transaction.memo,
      },
    };
  }
}
