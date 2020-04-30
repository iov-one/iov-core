import { Int53, Encoding } from "@iov/encoding";
import * as rlp from "rlp";
const { fromUtf8 } = Encoding;

/**
 * Encode as RLP (Recursive Length Prefix)
 */
export function toRlp(data: rlp.Input): Uint8Array {
  const dataBuffer = rlp.encode(data);
  return Uint8Array.from(dataBuffer);
}

/**
 * Decode from RLP (Recursive Length Prefix)
 */
export function fromRlp(data: Uint8Array): Uint8Array {
  // If this isn't hex data
  if (!isHex(data)) {
    return data;
  }
  const dataBuffer = rlp.decode(data);
  return new Uint8Array(Buffer.from(dataBuffer.toString()));
}
/**
 * IsHex returns true if the string starts with 0x
 */
export function isHex(data: Uint8Array): boolean {
  const stringData = fromUtf8(data);
  return stringData.length > 1 && stringData.toLocaleLowerCase().substring(0, 2) === "0x";
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
  if (chain.forkState === BlknumForkState.Forked) {
    if (chain.chainId === 0) {
      throw new Error("Chain ID must be > 0 after eip155 implementation");
    }
    // chain ID available
    return chain.chainId * 2 + recoveryParam + 35;
  } else {
    return recoveryParam + 27;
  }
}

export function getRecoveryParam(chain: Eip155ChainId, v: number): number {
  // After the implementation of EIP-155, clients are still free to use the old
  // way of calculating v does not protect their users against replay attacks.
  // https://ethereum.stackexchange.com/a/23955
  if (v === 27 || v === 28) {
    return v - 27;
  }

  if (chain.forkState === BlknumForkState.Forked && chain.chainId > 0) {
    // chain ID available
    const recoveryParam = new Int53(v - chain.chainId * 2 - 35);
    if (recoveryParam.toNumber() < 0 || recoveryParam.toNumber() > 3) {
      throw new Error(
        `Calculated recovery parameter must be one of 0, 1, 2, 3 but is ${recoveryParam}. ` +
          `Got v: ${v} and chain ID: ${chain.chainId}`,
      );
    }
    return recoveryParam.toNumber();
  }

  throw new Error("transaction not supported before eip155 implementation");
}
