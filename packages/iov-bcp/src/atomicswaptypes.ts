import { As } from "type-tagger";
import { Stream } from "xstream";

import { BlockchainConnection } from "./connection";
import { Address, Amount, LightTransaction, SwapId, SwapTimeout } from "./transactions";

export type Preimage = Uint8Array & As<"preimage">;
export type Hash = Uint8Array & As<"hash">;

// Transactions

/** A swap offer or a counter offer */
export interface SwapOfferTransaction extends LightTransaction {
  readonly kind: "bcp/swap_offer";
  /**
   * The ID of the swap to aid coordination between the two parties.
   *
   * If required, the data should be generated randomly by the client to avoid
   * collisions.
   *
   * The type of this may be extended with additional properties depending on
   * the requirements of the individual chain.
   */
  readonly swapId?: SwapId;
  readonly amounts: readonly Amount[];
  readonly recipient: Address;
  /**
   * The first point in time at which the offer is expired.
   *
   * Can be represented as a block height or UNIX timestamp.
   */
  readonly timeout: SwapTimeout;
  /**
   * Locally calculated hash of the preimage.
   *
   * This is a SHA256 hash until we have a way to specifiy the hashing algorithm.
   */
  readonly hash: Hash;
  readonly memo?: string;
}

export interface SwapClaimTransaction extends LightTransaction {
  readonly kind: "bcp/swap_claim";
  readonly preimage: Preimage;
  readonly swapId: SwapId; // pulled from the offer transaction
}

export interface SwapAbortTransaction extends LightTransaction {
  readonly kind: "bcp/swap_abort";
  readonly swapId: SwapId; // pulled from the offer transaction
}

export type SwapTransaction = SwapOfferTransaction | SwapClaimTransaction | SwapAbortTransaction;

export function isSwapOfferTransaction(transaction: LightTransaction): transaction is SwapOfferTransaction {
  return (transaction as SwapOfferTransaction).kind === "bcp/swap_offer";
}

export function isSwapClaimTransaction(transaction: LightTransaction): transaction is SwapClaimTransaction {
  return (transaction as SwapClaimTransaction).kind === "bcp/swap_claim";
}

export function isSwapAbortTransaction(transaction: LightTransaction): transaction is SwapAbortTransaction {
  return (transaction as SwapAbortTransaction).kind === "bcp/swap_abort";
}

export function isSwapTransaction(transaction: LightTransaction): transaction is SwapTransaction {
  return (
    isSwapOfferTransaction(transaction) ||
    isSwapClaimTransaction(transaction) ||
    isSwapAbortTransaction(transaction)
  );
}

// Non-transactions

export enum SwapProcessState {
  Open = "open",
  Claimed = "claimed",
  Aborted = "aborted",
}

export function isSwapProcessStateOpen(state: SwapProcessState): state is SwapProcessState.Open {
  return state === SwapProcessState.Open;
}

export function isSwapProcessStateClaimed(state: SwapProcessState): state is SwapProcessState.Claimed {
  return state === SwapProcessState.Claimed;
}

export function isSwapProcessStateAborted(state: SwapProcessState): state is SwapProcessState.Aborted {
  return state === SwapProcessState.Aborted;
}

export interface SwapData {
  readonly id: SwapId;
  readonly sender: Address;
  readonly recipient: Address;
  /**
   * The hash, whose preimage releases the atomic swap.
   *
   * Until we have a way to specify the hashing algirithm, this is SHA256.
   */
  readonly hash: Hash;
  readonly amounts: readonly Amount[];
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

export function isOpenSwap(swap: AtomicSwap): swap is OpenSwap {
  return isSwapProcessStateOpen(swap.kind);
}

export function isClaimedSwap(swap: AtomicSwap): swap is ClaimedSwap {
  return isSwapProcessStateClaimed(swap.kind);
}

export function isAbortedSwap(swap: AtomicSwap): swap is AbortedSwap {
  return isSwapProcessStateAborted(swap.kind);
}

export interface AtomicSwapRecipientQuery {
  readonly recipient: Address;
}

export interface AtomicSwapSenderQuery {
  readonly sender: Address;
}

export interface AtomicSwapIdQuery {
  readonly id: SwapId;
}

export interface AtomicSwapHashQuery {
  readonly hash: Hash;
}

export type AtomicSwapQuery =
  | AtomicSwapRecipientQuery
  | AtomicSwapSenderQuery
  | AtomicSwapIdQuery
  | AtomicSwapHashQuery;

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
  return (query as AtomicSwapIdQuery).id !== undefined;
}

/** a type guard to use in the swap-based queries  */
export function isAtomicSwapHashQuery(query: AtomicSwapQuery): query is AtomicSwapHashQuery {
  return (query as AtomicSwapHashQuery).hash !== undefined;
}

/**
 * An optional extension to the base BlockchainConnection that
 * allows querying and watching atomic swaps
 */
export interface AtomicSwapConnection extends BlockchainConnection {
  /** returns all matching swaps in their current state */
  readonly getSwaps: (swap: AtomicSwapQuery) => Promise<readonly AtomicSwap[]>;

  /**
   * Emits currentState (getSwaps) as a stream, then sends updates for any matching swap.
   *
   * This includes an open swap beind claimed/expired as well as a new matching swap
   * being offered
   */
  readonly watchSwaps: (swap: AtomicSwapQuery) => Stream<AtomicSwap>;
}

export function isAtomicSwapConnection(conn: BlockchainConnection): conn is AtomicSwapConnection {
  const check = conn as AtomicSwapConnection;
  return typeof check.getSwaps === "function" && typeof check.watchSwaps === "function";
}
