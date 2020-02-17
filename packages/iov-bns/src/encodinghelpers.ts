import { Amount } from "@iov/bcp";
import { Int53, Uint64 } from "@iov/encoding";

import { weaveFractionalDigits } from "./constants";
import * as codecImpl from "./generated/codecimpl";

export function encodeInt(intNumber: number): number | null {
  if (!Number.isInteger(intNumber)) {
    throw new Error("Received some kind of number that can't be encoded.");
  }

  // Normalizes the zero value to null as expected by weave
  return intNumber || null;
}

export function encodeString(data: string | undefined): string | null {
  // Normalizes the empty string to null as expected by weave
  return data || null;
}

export function encodeAmount(amount: Amount): codecImpl.coin.ICoin {
  if (amount.fractionalDigits !== weaveFractionalDigits) {
    throw new Error(`Fractional digits must be ${weaveFractionalDigits} but was ${amount.fractionalDigits}`);
  }

  const whole = Int53.fromString(amount.quantity.slice(0, -amount.fractionalDigits) || "0");
  const fractional = Int53.fromString(amount.quantity.slice(-amount.fractionalDigits) || "0");
  return {
    whole: encodeInt(whole.toNumber()),
    fractional: encodeInt(fractional.toNumber()),
    ticker: encodeString(amount.tokenTicker),
  };
}

export function encodeNumericId(id: number): Uint8Array {
  return Uint64.fromNumber(id).toBytesBigEndian();
}
