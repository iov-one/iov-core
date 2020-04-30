import * as rlp from "rlp";
/**
 * Encode as RLP (Recursive Length Prefix)
 */
export declare function toRlp(data: rlp.Input): Uint8Array;
/**
 * Dencode as RLP (Recursive Length Prefix)
 */
export declare function fromRlp(data: Uint8Array): Uint8Array;
/**
 * IsHex returns true if the string starts with 0x
 */
export declare function isHex(data: Uint8Array): boolean;

/** changes with each chain */
export declare enum BlknumForkState {
  /** before height 2,675,000 for mainnet */
  Before = 0,
  /** for mainnet height 2,675,000 and after */
  Forked = 1,
}
/** Information attached to a signature about its state in a block */
export declare type Eip155ChainId =
  | {
      readonly forkState: BlknumForkState.Before;
    }
  | {
      readonly forkState: BlknumForkState.Forked;
      /** numeric chain ID as defined in EIP155 */
      readonly chainId: number;
    };
export declare function eip155V(chain: Eip155ChainId, recoveryParam: number): number;
export declare function getRecoveryParam(chain: Eip155ChainId, v: number): number;
