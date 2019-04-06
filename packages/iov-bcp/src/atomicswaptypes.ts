import { As } from "type-tagger";
import { Stream } from "xstream";

import { BcpConnection } from "./connection";
import { Address, Amount, SwapIdBytes, SwapTimeout } from "./transactions";

export enum SwapProcessState {
  Open = "open",
  Claimed = "claimed",
  Aborted = "aborted",
}

export type Preimage = Uint8Array & As<"preimage">;
export type Hash = Uint8Array & As<"hash">;

export interface SwapData {
  readonly id: SwapIdBytes; // this is used as an unique identitier to locate the swap
  readonly sender: Address;
  readonly recipient: Address;
  /**
   * The hash, whose preimage releases the atomic swap.
   *
   * Until we have a way to specify the hashing algirithm, this is SHA256.
   */
  readonly hash: Hash;
  readonly amounts: ReadonlyArray<Amount>;
  /**
   * The first point in time at which the offer is expired.
   *
   * Can be represented as a block height or UNIX timestamp.
   */
  readonly timeout: SwapTimeout;
  readonly memo?: string;
}

// OpenSwap is an offer that has not yet been claimed
export interface OpenSwap {
  readonly kind: SwapProcessState.Open;
  readonly data: SwapData;
}

// ClosedSwap is returned once the swap has been claimed, exposing the preimage that was used to claim it
export interface ClaimedSwap {
  readonly kind: SwapProcessState.Claimed;
  readonly data: SwapData;
  readonly preimage: Preimage;
}

/** A swap offer that has been aborted */
export interface AbortedSwap {
  readonly kind: SwapProcessState.Aborted;
  readonly data: SwapData;
}

export type AtomicSwap = OpenSwap | ClaimedSwap | AbortedSwap;

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
