import { Stream } from "xstream";

import { BcpCoin, BcpConnection, BcpQueryEnvelope } from "./bcp";
import { Address } from "./signables";
import { SwapIdBytes } from "./transactions";

export enum SwapState {
  OPEN = "open",
  CLAIMED = "claimed",
  EXPIRED = "expired",
}

export interface SwapData {
  readonly id: SwapIdBytes; // this is used as an unique identitier to locate the swap
  readonly sender: Address;
  readonly recipient: Address;
  readonly hashlock: Uint8Array; // this is the hash, whose preimage releases the swap
  readonly amount: ReadonlyArray<BcpCoin>;
  readonly timeout: number; // blockheight where the swap expires (TODO: alternatively support Date?)
  readonly memo?: string;
}

// OpenSwap is an offer that has not yet been claimed
export interface OpenSwap {
  readonly kind: SwapState.OPEN;
  readonly data: SwapData;
}

// ClosedSwap is returned once the swap has been claimed, exposing the preimage that was used to claim it
export interface ClaimedSwap {
  readonly kind: SwapState.CLAIMED;
  readonly data: SwapData;
  readonly preimage: Uint8Array;
}

// ExpiredSwap is an offer that timed out without being claimed
export interface ExpiredSwap {
  readonly kind: SwapState.EXPIRED;
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

// can we implement this as well? maybe id should equal swap
// export interface SwapHashQuery {
//   readonly hashlock: Uint8Array;
// }

export type BcpSwapQuery = BcpSwapRecipientQuery | BcpSwapSenderQuery | BcpSwapIdQuery;

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

// BcpAtomicSwapConnection is an optional extension to the base BcpConnection
// It allows querying and watching atomic swaps
export interface BcpAtomicSwapConnection extends BcpConnection {
  // getSwap returns all matching swaps in their current state
  readonly getSwap: (swap: BcpSwapQuery) => Promise<BcpQueryEnvelope<BcpAtomicSwap>>;

  // watchSwap emits currentState (getSwap) as a stream, then sends updates for any matching swap
  // this includes an open swap beind claimed/expired as well as a new matching swap being offered
  readonly watchSwap: (swap: BcpSwapQuery) => Stream<BcpAtomicSwap>;
}

export function isAtomicSwapConnection(conn: BcpConnection): conn is BcpAtomicSwapConnection {
  const check = conn as BcpAtomicSwapConnection;
  return typeof check.getSwap === "function" && typeof check.watchSwap === "function";
}
