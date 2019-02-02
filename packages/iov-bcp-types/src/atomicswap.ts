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
  /**
   * The hash, whose preimage releases the atomic swap.
   *
   * Until we have a way to specify the hashing algirithm, this is SHA256.
   */
  readonly hash: Uint8Array;
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

export type AtomicSwap = OpenSwap | ClaimedSwap | ExpiredSwap;

export interface AtomicSwapRecipientQuery {
  readonly recipient: Address;
}

export interface AtomicSwapSenderQuery {
  readonly sender: Address;
}

export interface AtomicSwapIdQuery {
  readonly swapid: SwapIdBytes;
}

// on some chains, swapid may equal hashlock, but often these may differ
export interface AtomicSwapHashlockQuery {
  readonly hashlock: Uint8Array;
}

export type AtomicSwapQuery =
  | AtomicSwapRecipientQuery
  | AtomicSwapSenderQuery
  | AtomicSwapIdQuery
  | AtomicSwapHashlockQuery;

/** a type guard to use in the swap-based queries  */
export function isAtomicSwapRecipientQuery(query: AtomicSwapQuery): query is AtomicSwapRecipientQuery {
  return (query as AtomicSwapRecipientQuery).recipient !== undefined;
}

/** a type guard to use in the swap-based queries  */
export function isAtomicSwapSenderQuery(query: AtomicSwapQuery): query is AtomicSwapSenderQuery {
  return (query as AtomicSwapSenderQuery).sender !== undefined;
}

/** a type guard to use in the swap-based queries  */
export function isAtomicSwapIdQuery(query: AtomicSwapQuery): query is AtomicSwapIdQuery {
  return (query as AtomicSwapIdQuery).swapid !== undefined;
}

/** a type guard to use in the swap-based queries  */
export function isAtomicSwapHashlockQuery(query: AtomicSwapQuery): query is AtomicSwapHashlockQuery {
  return (query as AtomicSwapHashlockQuery).hashlock !== undefined;
}

/**
 * An optional extension to the base BcpConnection that
 * allows querying and watching atomic swaps
 */
export interface BcpAtomicSwapConnection extends BcpConnection {
  /** returns all matching swaps in their current state */
  readonly getSwaps: (swap: AtomicSwapQuery) => Promise<ReadonlyArray<AtomicSwap>>;

  /**
   * Emits currentState (getSwaps) as a stream, then sends updates for any matching swap.
   *
   * This includes an open swap beind claimed/expired as well as a new matching swap
   * being offered
   */
  readonly watchSwaps: (swap: AtomicSwapQuery) => Stream<AtomicSwap>;
}

export function isAtomicSwapConnection(conn: BcpConnection): conn is BcpAtomicSwapConnection {
  const check = conn as BcpAtomicSwapConnection;
  return typeof check.getSwaps === "function" && typeof check.watchSwaps === "function";
}
