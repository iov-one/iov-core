import { ChainId, Nonce } from "@iov/bcp";
import { Uint53 } from "@iov/encoding";

import BN = require("bn.js");
import { Abi } from "./abi";

const bcpChainIdPrefix = "ethereum-eip155-";

export function decodeHexQuantity(hexString: string): number {
  // "0x00" in ganache response is an error: zero should be represented as "0x0"
  // "0x0n" in ganache response is an error: no leading zeroes allowed, when fixed implement {1}[a-f1-9]
  if (hexString.match(/^0x[a-f0-9]+$/)) {
    return parseInt(hexString, 16);
  }
  throw new Error("invalid hex quantity input");
}

export function decodeHexQuantityString(hexString: string): string {
  if (hexString.match(/^0x[a-f0-9]+$/)) {
    const hexToBN = new BN(hexString.replace("0x", ""), 16);
    return hexToBN.toString();
  }
  throw new Error("invalid hex quantity input");
}

export function decodeHexQuantityNonce(hexString: string): Nonce {
  const value = new Uint53(decodeHexQuantity(hexString));
  return value.toNumber() as Nonce;
}

export function encodeQuantity(value: number): string {
  try {
    const checkedValue = new Uint53(value);
    return "0x" + new BN(checkedValue.toNumber()).toString(16);
  } catch {
    throw new Error("Input is not a unsigned safe integer");
  }
}

export function encodeQuantityString(value: string): string {
  if (!value.match(/^[0-9]+$/)) {
    throw new Error("Input is not a valid string number");
  }
  return "0x" + new BN(value).toString(16);
}

/**
 * Takes a hex representation optionally prefixed with 0x and returns a normalized
 * representation: unprefixed, padded to even characters count, lower case.
 */
export function normalizeHex(input: string): string {
  const unprefixedLower = input.replace("0x", "").toLowerCase();
  if (unprefixedLower.length % 2 !== 0) {
    return "0" + unprefixedLower;
  } else {
    return unprefixedLower;
  }
}

export function toBcpChainId(numericChainId: number): ChainId {
  const parsed = new Uint53(numericChainId);
  return `${bcpChainIdPrefix}${parsed.toString()}` as ChainId;
}

export function fromBcpChainId(chainId: ChainId): number {
  if (!chainId.startsWith(bcpChainIdPrefix)) {
    throw new Error(`Expected chain ID to start with '${bcpChainIdPrefix}'`);
  }

  const rest = chainId.slice(bcpChainIdPrefix.length);
  if (rest !== "0" && !rest.match(/^[1-9]{1}[0-9]*$/)) {
    throw new Error("Invalid format of EIP155 chain ID");
  }

  return Uint53.fromString(rest).toNumber();
}

/**
 * A function to determine if a transaction is interpreted as ERC20 transfer.
 * We can not know for sure if it was a ERC20 call without knowledge of the recipient type,
 * which is not available at the codec level.
 */
export function shouldBeInterpretedAsErc20Transfer(input: Uint8Array, ethQuantity: string): boolean {
  if (ethQuantity !== "0") {
    return false;
  }

  if (input.length !== 4 + 32 + 32) {
    return false;
  }

  const expectedPrefix = Abi.calculateMethodId("transfer(address,uint256)");
  if (expectedPrefix.some((byte, index) => input[index] !== byte)) {
    return false;
  }

  return true;
}
