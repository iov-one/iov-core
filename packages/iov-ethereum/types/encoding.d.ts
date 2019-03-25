import * as rlp from "rlp";
/**
 * Encode as RLP (Recursive Length Prefix)
 */
export declare function toRlp(data: rlp.Input): Uint8Array;
/** changes with each chain */
export declare enum BlknumForkState {
    /** before height 2,675,000 for mainnet */
    Before = 0,
    /** for mainnet height 2,675,000 and after */
    Forked = 1
}
/** Information attached to a signature about its state in a block */
export declare type Eip155ChainId = {
    readonly forkState: BlknumForkState.Before;
} | {
    readonly forkState: BlknumForkState.Forked;
    /** numeric chain ID as defined in EIP155 */
    readonly chainId: number;
};
export declare function eip155V(chain: Eip155ChainId, recoveryParam: number): number;
export declare function getRecoveryParam(chain: Eip155ChainId, v: number): number;
export interface HeadTail {
    /** An array of start positions within the original data */
    readonly head: ReadonlyArray<number>;
    /** Arguments split by positions as defined by head */
    readonly tail: ReadonlyArray<Uint8Array>;
}
/**
 * Decode head-tail encoded data as described in
 * https://medium.com/@hayeah/how-to-decipher-a-smart-contract-method-call-8ee980311603
 */
export declare function decodeHeadTail(data: Uint8Array): HeadTail;
