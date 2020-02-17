import { Address, SwapProcessState } from "@iov/bcp";
import { Keccak256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import BN from "bn.js";

import { isValidAddress, toChecksummedAddress } from "./address";

export interface HeadTail {
  /** An array of start positions within the original data */
  readonly head: readonly number[];
  /** Arguments split by positions as defined by head */
  readonly tail: readonly Uint8Array[];
}

export enum SwapContractEvent {
  Opened,
  Claimed,
  Aborted,
}

export enum SwapContractMethod {
  Open,
  Claim,
  Abort,
}

export class Abi {
  public static calculateMethodHash(signature: string): Uint8Array {
    return new Keccak256(Encoding.toAscii(signature)).digest();
  }

  public static calculateMethodId(signature: string): Uint8Array {
    return Abi.calculateMethodHash(signature).slice(0, 4);
  }

  public static encodeAddress(address: Address): Uint8Array {
    if (!isValidAddress(address)) {
      throw new Error("Invalid address format");
    }

    const addressBytes = Encoding.fromHex(address.slice(2));
    return Abi.padTo32(addressBytes);
  }

  public static encodeUint256(value: string): Uint8Array {
    if (!value.match(/^[0-9]+$/)) {
      throw new Error("Invalid string format");
    }
    const numericValue = new BN(value, 10);
    return Uint8Array.from(numericValue.toArray("be", 32));
  }

  public static decodeAddress(binary: Uint8Array): Address {
    if (binary.length !== 32) {
      throw new Error("Input data not 256 bit long");
    }
    const firstTwelveBytes = binary.slice(0, 12);
    if (firstTwelveBytes.some(byte => byte !== 0)) {
      throw new Error("Input data is not zero-padded");
    }
    const lastTwentyBytes = binary.slice(-20);
    return toChecksummedAddress(lastTwentyBytes);
  }

  public static decodeUint256(binary: Uint8Array): string {
    if (binary.length !== 32) {
      throw new Error("Input data not 256 bit long");
    }
    return new BN(binary).toString();
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

  public static decodeSwapProcessState(data: Uint8Array): SwapProcessState {
    if (data.length !== 32) {
      throw new Error("Input data not 256 bit long");
    }
    const key = Abi.decodeUint256(data);
    const map: { readonly [key: string]: SwapProcessState } = {
      1: SwapProcessState.Open,
      2: SwapProcessState.Claimed,
      3: SwapProcessState.Aborted,
    };
    const state: SwapProcessState | undefined = map[key];

    if (state === undefined) {
      throw new Error("Invalid swap process state");
    }
    return state;
  }

  public static decodeEventSignature(data: Uint8Array): SwapContractEvent {
    if (data.length !== 32) {
      throw new Error("Input data not 256 bit long");
    }
    const key = Encoding.toHex(data);
    const map: { readonly [key: string]: SwapContractEvent } = {
      [Abi.eventSignatures.openedEth]: SwapContractEvent.Opened,
      [Abi.eventSignatures.openedErc20]: SwapContractEvent.Opened,
      [Abi.eventSignatures.claimed]: SwapContractEvent.Claimed,
      [Abi.eventSignatures.aborted]: SwapContractEvent.Aborted,
    };
    const event: SwapContractEvent | undefined = map[key];

    if (event === undefined) {
      throw new Error("Invalid event signature");
    }
    return event;
  }

  public static decodeMethodId(data: Uint8Array): SwapContractMethod {
    if (data.length !== 4) {
      throw new Error("Input data not 32 bit long");
    }
    const key = Encoding.toHex(data);
    const map: { readonly [key: string]: SwapContractMethod } = {
      [Abi.methodIds.openEth]: SwapContractMethod.Open,
      [Abi.methodIds.openErc20]: SwapContractMethod.Open,
      [Abi.methodIds.claim]: SwapContractMethod.Claim,
      [Abi.methodIds.abort]: SwapContractMethod.Abort,
    };
    const method: SwapContractMethod | undefined = map[key];

    if (method === undefined) {
      throw new Error("Invalid method ID");
    }
    return method;
  }

  private static readonly eventSignatures: {
    readonly openedEth: string;
    readonly openedErc20: string;
    readonly claimed: string;
    readonly aborted: string;
  } = {
    openedEth: Encoding.toHex(
      Abi.calculateMethodHash("Opened(bytes32,address,address,bytes32,uint256,uint256)"),
    ),
    openedErc20: Encoding.toHex(
      Abi.calculateMethodHash("Opened(bytes32,address,address,bytes32,uint256,uint256,address)"),
    ),
    claimed: Encoding.toHex(Abi.calculateMethodHash("Claimed(bytes32,bytes32)")),
    aborted: Encoding.toHex(Abi.calculateMethodHash("Aborted(bytes32)")),
  };

  private static readonly methodIds: {
    readonly openEth: string;
    readonly openErc20: string;
    readonly claim: string;
    readonly abort: string;
  } = {
    openEth: Encoding.toHex(Abi.calculateMethodId("open(bytes32,address,bytes32,uint256)")),
    openErc20: Encoding.toHex(Abi.calculateMethodId("open(bytes32,address,bytes32,uint256,address,uint256)")),
    claim: Encoding.toHex(Abi.calculateMethodId("claim(bytes32,bytes32)")),
    abort: Encoding.toHex(Abi.calculateMethodId("abort(bytes32)")),
  };

  private static padTo32(data: Uint8Array): Uint8Array {
    if (data.length > 32) {
      throw new Error("Input data greater than 32 not supported");
    }
    const padding = new Array(32 - data.length).fill(0);
    return new Uint8Array([...padding, ...data]);
  }
}
