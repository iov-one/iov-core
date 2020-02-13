import { Address, Amount, ChainId, ConfirmedTransaction, OpenSwap, SwapOfferTransaction } from "@iov/bcp";
import * as codecImpl from "./generated/codecimpl";
import { Keyed } from "./types";
/** Like BCP's Account but with no pubkey. Keep compatible to Account! */
export interface WalletData {
  readonly address: Address;
  readonly balance: readonly Amount[];
}
export declare class Context {
  private readonly chainId;
  constructor(chainId: ChainId);
  wallet(acct: codecImpl.cash.ISet & Keyed): WalletData;
  /** Decode within a Context to have the chain ID available */
  decodeOpenSwap(swap: codecImpl.aswap.Swap & Keyed): OpenSwap;
  swapOfferFromTx(confirmed: ConfirmedTransaction<SwapOfferTransaction>): OpenSwap;
}
