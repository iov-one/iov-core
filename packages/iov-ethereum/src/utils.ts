import { Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

import BN = require("bn.js");

export function decodeHexQuantity(hexString: string): number {
  // "0x00" in ganache response is an error: zero should be represented as "0x0"
  if (hexString === "0x0" || hexString === "0x00" || hexString.match(/^0x{1}[a-f1-9][a-f0-9]*$/)) {
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
  if (Number.isNaN(value)) {
    throw new Error("Input is not a number");
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

export function stringDataToHex(stringData: string): string {
  let hex = "";
  for (let i = 0; i < stringData.length; i++) {
    const n = stringData.charCodeAt(i).toString(16);
    hex += n.length < 2 ? "0" + n : n;
  }
  return "0x" + hex;
}

export function hexPadToEven(hex: string): string {
  if (hex.length % 2 !== 0) {
    return "0" + hex.replace("0x", "");
  }
  return hex.replace("0x", "");
}
