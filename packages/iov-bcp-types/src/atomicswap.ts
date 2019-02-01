import { Stream } from "xstream";

import { BcpConnection } from "./connection";
import { Address, Amount, SwapIdBytes } from "./transactions";

export enum SwapState {
  Open = "open",
  Claimed = "claimed",
  Expired = "expired",
}

export interface SwapData {
  readonly id: SwapIdBytes; // this is used as an unique identitier to locate the swap
  readonly sender: Address;
  readonly recipient: Address;
  readonly hashlock: Uint8Array; // this is the hash, whose preimage releases the swap
  readonly amounts: ReadonlyArray<Amount>;
  readonly timeout: number; // blockheight where the swap expires (TODO: alternatively support Date?)
  readonly memo?: string;
}

// OpenSwap is an offer that has not yet been claimed
export interface OpenSwap {
  readonly kind: SwapState.Open;
  readonly data: SwapData;
}

// ClosedSwap is returned once the swap has been claimed, exposing the preimage that was used to claim it
export interface ClaimedSwap {
  readonly kind: SwapState.Claimed;
  readonly data: SwapData;
  readonly preimage: Uint8Array;
}

// ExpiredSwap is an offer that timed out without being claimed
export interface ExpiredSwap {
  readonly kind: SwapState.Expired;
  readonly data: SwapData;
}

export type BcpAtomicSwap = OpenSwap | ClaimedSwap | ExpiredSwap;

export interface BcpSwapRecipientQuery {
  readonly recipient: Address;
}

export interface BcpSwapSenderQuery {
  readonly sender: Address;
}

export interface BcpSwapIdQuery {
  readonly swapid: SwapIdBytes;
}

// on some chains, swapid may equal hashlock, but often these may differ
export interface BcpSwapHashQuery {
  readonly hashlock: Uint8Array;
}

export type BcpSwapQuery = BcpSwapRecipientQuery | BcpSwapSenderQuery | BcpSwapIdQuery | BcpSwapHashQuery;

// isQueryBySwapRecipient is a type guard to use in the swap-based queries
export function isQueryBySwapRecipient(query: BcpSwapQuery): query is BcpSwapRecipientQuery {
  return (query as BcpSwapRecipientQuery).recipient !== undefined;
}
// isQueryBySwapSender is a type guard to use in the swap-based queries
export function isQueryBySwapSender(query: BcpSwapQuery): query is BcpSwapSenderQuery {
  return (query as BcpSwapSenderQuery).sender !== undefined;
}
// isQueryBySwapId is a type guard to use in the swap-based queries
export function isQueryBySwapId(query: BcpSwapQuery): query is BcpSwapIdQuery {
  return (query as BcpSwapIdQuery).swapid !== undefined;
}
// isQueryBySwapHash is a type guard to use in the swap-based queries
export function isQueryBySwapHash(query: BcpSwapQuery): query is BcpSwapHashQuery {
  return (query as BcpSwapHashQuery).hashlock !== undefined;
}

/**
 * An optional extension to the base BcpConnection that
 * allows querying and watching atomic swaps
 */
export interface BcpAtomicSwapConnection extends BcpConnection {
  /** returns all matching swaps in their current state */
  readonly getSwaps: (swap: BcpSwapQuery) => Promise<ReadonlyArray<BcpAtomicSwap>>;

  /**
   * Emits currentState (getSwaps) as a stream, then sends updates for any matching swap.
   *
   * This includes an open swap beind claimed/expired as well as a new matching swap
   * being offered
   */
  readonly watchSwaps: (swap: BcpSwapQuery) => Stream<BcpAtomicSwap>;
}

export function isAtomicSwapConnection(conn: BcpConnection): conn is BcpAtomicSwapConnection {
  const check = conn as BcpAtomicSwapConnection;
  return typeof check.getSwaps === "function" && typeof check.watchSwaps === "function";
}
