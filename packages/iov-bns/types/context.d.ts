import {
  Address,
  Amount,
  ChainId,
  ConfirmedTransaction,
  OpenSwap,
  SwapOfferTransaction,
  WithCreator,
} from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import { Keyed } from "./types";
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
export declare class Context {
  private readonly chainData;
  constructor(chainData: ChainData);
  wallet(acct: codecImpl.cash.ISet & Keyed): WalletData;
  /** Decode within a Context to have the chain ID available */
  decodeOpenSwap(swap: codecImpl.aswap.Swap & Keyed): OpenSwap;
  swapOfferFromTx(confirmed: ConfirmedTransaction<SwapOfferTransaction & WithCreator>): OpenSwap;
}
