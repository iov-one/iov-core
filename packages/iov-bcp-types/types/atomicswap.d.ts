import { Stream } from "xstream";
import { BcpCoin, BcpConnection } from "./connection";
import { Address, SwapIdBytes } from "./transactions";
export declare enum SwapState {
    Open = "open",
    Claimed = "claimed",
    Expired = "expired"
}
export interface SwapData {
    readonly id: SwapIdBytes;
    readonly sender: Address;
    readonly recipient: Address;
    readonly hashlock: Uint8Array;
    readonly amount: ReadonlyArray<BcpCoin>;
    readonly timeout: number;
    readonly memo?: string;
}
export interface OpenSwap {
    readonly kind: SwapState.Open;
    readonly data: SwapData;
}
export interface ClaimedSwap {
    readonly kind: SwapState.Claimed;
    readonly data: SwapData;
    readonly preimage: Uint8Array;
}
export interface ExpiredSwap {
    readonly kind: SwapState.Expired;
    readonly data: SwapData;
}
export declare type BcpAtomicSwap = OpenSwap | ClaimedSwap | ExpiredSwap;
export interface BcpSwapRecipientQuery {
    readonly recipient: Address;
}
export interface BcpSwapSenderQuery {
    readonly sender: Address;
}
export interface BcpSwapIdQuery {
    readonly swapid: SwapIdBytes;
}
export interface BcpSwapHashQuery {
    readonly hashlock: Uint8Array;
}
export declare type BcpSwapQuery = BcpSwapRecipientQuery | BcpSwapSenderQuery | BcpSwapIdQuery | BcpSwapHashQuery;
export declare function isQueryBySwapRecipient(query: BcpSwapQuery): query is BcpSwapRecipientQuery;
export declare function isQueryBySwapSender(query: BcpSwapQuery): query is BcpSwapSenderQuery;
export declare function isQueryBySwapId(query: BcpSwapQuery): query is BcpSwapIdQuery;
export declare function isQueryBySwapHash(query: BcpSwapQuery): query is BcpSwapHashQuery;
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
export declare function isAtomicSwapConnection(conn: BcpConnection): conn is BcpAtomicSwapConnection;
