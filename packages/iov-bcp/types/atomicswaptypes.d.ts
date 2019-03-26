import { As } from "type-tagger";
import { Stream } from "xstream";
import { BcpConnection } from "./connection";
import { Address, Amount, SwapIdBytes, SwapTimeout } from "./transactions";
export declare enum SwapState {
    Open = "open",
    Claimed = "claimed",
    Expired = "expired"
}
export interface SwapData {
    readonly id: SwapIdBytes;
    readonly sender: Address;
    readonly recipient: Address;
    /**
     * The hash, whose preimage releases the atomic swap.
     *
     * Until we have a way to specify the hashing algirithm, this is SHA256.
     */
    readonly hash: Uint8Array;
    readonly amounts: ReadonlyArray<Amount>;
    /**
     * The first point in time at which the offer is expired.
     *
     * Can be represented as a block height or UNIX timestamp.
     */
    readonly timeout: SwapTimeout;
    readonly memo?: string;
}
export interface OpenSwap {
    readonly kind: SwapState.Open;
    readonly data: SwapData;
}
export declare type Preimage = Uint8Array & As<"preimage">;
export interface ClaimedSwap {
    readonly kind: SwapState.Claimed;
    readonly data: SwapData;
    readonly preimage: Preimage;
}
export interface ExpiredSwap {
    readonly kind: SwapState.Expired;
    readonly data: SwapData;
}
export declare type AtomicSwap = OpenSwap | ClaimedSwap | ExpiredSwap;
export interface AtomicSwapRecipientQuery {
    readonly recipient: Address;
}
export interface AtomicSwapSenderQuery {
    readonly sender: Address;
}
export interface AtomicSwapIdQuery {
    readonly swapid: SwapIdBytes;
}
export interface AtomicSwapHashlockQuery {
    readonly hashlock: Uint8Array;
}
export declare type AtomicSwapQuery = AtomicSwapRecipientQuery | AtomicSwapSenderQuery | AtomicSwapIdQuery | AtomicSwapHashlockQuery;
/** a type guard to use in the swap-based queries  */
export declare function isAtomicSwapRecipientQuery(query: AtomicSwapQuery): query is AtomicSwapRecipientQuery;
/** a type guard to use in the swap-based queries  */
export declare function isAtomicSwapSenderQuery(query: AtomicSwapQuery): query is AtomicSwapSenderQuery;
/** a type guard to use in the swap-based queries  */
export declare function isAtomicSwapIdQuery(query: AtomicSwapQuery): query is AtomicSwapIdQuery;
/** a type guard to use in the swap-based queries  */
export declare function isAtomicSwapHashlockQuery(query: AtomicSwapQuery): query is AtomicSwapHashlockQuery;
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
export declare function isAtomicSwapConnection(conn: BcpConnection): conn is BcpAtomicSwapConnection;
