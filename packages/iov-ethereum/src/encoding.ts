import BN = require("bn.js");
import * as rlp from "rlp";

import { Int53 } from "@iov/encoding";

/**
 * Encode as RLP (Recursive Length Prefix)
 */
export function toRlp(data: rlp.Input): Uint8Array {
  const dataBuffer = rlp.encode(data);
  return Uint8Array.from(dataBuffer);
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
export function decodeHeadTail(data: Uint8Array): HeadTail {
  if (data.length % 32 !== 0) {
    throw new Error("Input data length not divisible by 32");
  }

  if (data.length === 0) {
    throw new Error("Input data empty");
  }

  const firstTailPosition = new BN(data.slice(0, 32)).toNumber();

  if (firstTailPosition === 0 || firstTailPosition % 32 !== 0 || firstTailPosition >= data.length) {
    throw new Error("Invalid head length");
  }

  const startPositions = new Array<number>();
  for (let pos = 0; pos < firstTailPosition; pos += 32) {
    const startPosition = new BN(data.slice(pos, pos + 32)).toNumber();

    if (startPosition < firstTailPosition) {
      throw new Error("Found start position inside the header");
    }

    startPositions.push(startPosition);
  }

  const contents = startPositions.map((startPosition, argumentIndex) => {
    const length =
      startPositions[argumentIndex + 1] !== undefined
        ? startPositions[argumentIndex + 1] - startPosition
        : data.length - startPosition;
    return data.slice(startPosition, startPosition + length);
  });

  return {
    head: startPositions,
    tail: contents,
  };
}

export function decodeVariableLength(data: Uint8Array): Uint8Array {
  if (data.length % 32 !== 0) {
    throw new Error("Input data length not divisible by 32");
  }

  if (data.length === 0) {
    throw new Error("Input data empty");
  }

  const length = new BN(data.slice(0, 32)).toNumber();

  return data.slice(32, 32 + length);
}
