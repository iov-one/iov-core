import { ChainId, Nonce } from "@iov/bcp-types";
import { Int53, Uint53 } from "@iov/encoding";

import BN = require("bn.js");

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
  const nonce = decodeHexQuantity(hexString);
  return new Int53(nonce) as Nonce;
}

export function encodeQuantity(value: number): string {
  if (Number.isNaN(value) || !/^[0-9]+$/.test(String(value))) {
    throw new Error("Input is not a valid number");
  }
  try {
    return "0x" + new BN(value).toString(16);
  } catch {
    throw new Error("Input is not a safe integer");
  }
}

export function encodeQuantityString(value: string): string {
  if (!value.match(/^[0-9]+$/)) {
    throw new Error("Input is not a valid string number");
  }
  return "0x" + new BN(value).toString(16);
}

export function hexPadToEven(hex: string): string {
  if (hex.length % 2 !== 0) {
    return "0" + hex.replace("0x", "");
  }
  return hex.replace("0x", "");
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
