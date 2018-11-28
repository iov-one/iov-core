import * as rlp from "rlp";

import { safeBufferValues } from "./safebufferhelpers";

// data: rlp.EncodeInput error
export function toRlp(data: any): Uint8Array {
  const dataBuffer = rlp.encode(data);
  return Uint8Array.from(safeBufferValues(dataBuffer));
}

/** changes with each chain */
export enum BlknumForkState {
  /** before height 2,675,000 for mainnet */
  Before,
  /** for mainnet height 2,675,000 and after */
  Forked,
}

/** Information attached to a signature about its state in a block */
export type Eip155ChainId =
  | { readonly forkState: BlknumForkState.Before }
  | {
      readonly forkState: BlknumForkState.Forked;
      /** numeric chain ID as defined in EIP155 */
      readonly chainId: number;
    };

export function eip155V(chain: Eip155ChainId, recoveryParam: number): number {
  if (chain.forkState === BlknumForkState.Forked && chain.chainId > 0) {
    // chain ID available
    return chain.chainId * 2 + recoveryParam + 35;
  }
  throw new Error("transaction not supported before eip155 implementation");
}
