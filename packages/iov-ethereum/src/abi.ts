import BN = require("bn.js");

import { Address } from "@iov/bcp";
import { Encoding } from "@iov/encoding";
import { isValidAddress } from "./address";

export interface HeadTail {
  /** An array of start positions within the original data */
  readonly head: ReadonlyArray<number>;
  /** Arguments split by positions as defined by head */
  readonly tail: ReadonlyArray<Uint8Array>;
}

export class Abi {
  public static encodeAddress(address: Address): Uint8Array {
    if (!isValidAddress(address)) {
      throw new Error("Invalid address format");
    }

    const addressBytes = Encoding.fromHex(address.slice(2));
    return Abi.padTo32(addressBytes);
  }

  /**
   * Decode head-tail encoded data as described in
   * https://medium.com/@hayeah/how-to-decipher-a-smart-contract-method-call-8ee980311603
   */
  public static decodeHeadTail(data: Uint8Array): HeadTail {
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

  public static decodeVariableLength(data: Uint8Array): Uint8Array {
    if (data.length % 32 !== 0) {
      throw new Error("Input data length not divisible by 32");
    }

    if (data.length === 0) {
      throw new Error("Input data empty");
    }

    const length = new BN(data.slice(0, 32)).toNumber();

    return data.slice(32, 32 + length);
  }

  private static padTo32(data: Uint8Array): Uint8Array {
    if (data.length > 32) {
      throw new Error("Input data greater than 32 not supported");
    }
    const padding = new Array(32 - data.length).fill(0);
    return new Uint8Array([...padding, ...data]);
  }
}
