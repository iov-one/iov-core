import { ReadonlyDate } from "readonly-date";
import { As } from "type-tagger";

import { Encoding, Int53 } from "@iov/encoding";

export type Base64String = string & As<"base64">;
export type HexString = string & As<"hex">;
export type IntegerString = string & As<"integer">;
export type DateTimeString = string & As<"datetime">;

/**
 * A runtime checker that ensures a given value is set (i.e. not undefined or null)
 *
 * This is used when you want to verify that data at runtime matches the expected type.
 */
export function assertSet<T>(value: T): T {
  if ((value as unknown) === undefined) {
    throw new Error("Value must not be undefined");
  }

  if ((value as unknown) === null) {
    throw new Error("Value must not be null");
  }

  return value;
}

interface Lengther {
  readonly length: number;
}

/**
 * Throws an error if value matches the empty value for the
 * given type (array/string of length 0, number of value 0, ...)
 *
 * Otherwise returns the value.
 *
 * This implies assertSet
 */
export function assertNotEmpty<T>(value: T): T {
  assertSet(value);

  if (typeof value === "number" && value === 0) {
    throw new Error("must provide a non-zero value");
  } else if (((value as any) as Lengther).length === 0) {
    throw new Error("must provide a non-empty value");
  }
  return value;
}

// optional uses the value or provides a default
export function optional<T>(value: T | null | undefined, fallback: T): T {
  return value === undefined || value === null ? fallback : value;
}

// may will run the transform if value is defined, otherwise returns undefined
export function may<T, U>(transform: (val: T) => U, value: T | null | undefined): U | undefined {
  return value === undefined || value === null ? undefined : transform(value);
}

export class Integer {
  public static parse(str: IntegerString): number {
    return Int53.fromString(str).toNumber();
  }

  public static encode(num: number): IntegerString {
    return new Int53(num).toString() as IntegerString;
  }

  public static ensure(num: unknown): number {
    if (typeof num !== "number") {
      throw new Error(`${num} is not a number`);
    }
    if (!Number.isInteger(num)) {
      throw new Error(`${num} is not an integer`);
    }
    return num;
  }
}

export class Base64 {
  public static encode(data: Uint8Array): Base64String {
    return Encoding.toBase64(data) as Base64String;
  }

  public static decode(base64String: Base64String): Uint8Array {
    return Encoding.fromBase64(base64String);
  }
}

export class DateTime {
  public static decode(dateTimeString: DateTimeString): ReadonlyDate {
    return Encoding.fromRfc3339(dateTimeString);
  }
}

export class Hex {
  public static encode(data: Uint8Array): HexString {
    return Encoding.toHex(data) as HexString;
  }

  public static decode(hexString: HexString): Uint8Array {
    return Encoding.fromHex(hexString);
  }
}
