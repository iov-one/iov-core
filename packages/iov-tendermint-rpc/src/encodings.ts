import { fromBase64, fromHex, fromRfc3339, Int53, toBase64, toHex, toUtf8 } from "@iov/encoding";
import { As } from "type-tagger";

import { BlockId, ReadonlyDateWithNanoseconds, Version } from "./responses";

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

/**
 * A runtime checker that ensures a given value is a boolean
 *
 * This is used when you want to verify that data at runtime matches the expected type.
 * This implies assertSet.
 */
export function assertBoolean(value: boolean): boolean {
  assertSet(value);
  if (typeof (value as unknown) !== "boolean") {
    throw new Error("Value must be a boolean");
  }
  return value;
}

/**
 * A runtime checker that ensures a given value is a number
 *
 * This is used when you want to verify that data at runtime matches the expected type.
 * This implies assertSet.
 */
export function assertNumber(value: number): number {
  assertSet(value);
  if (typeof (value as unknown) !== "number") {
    throw new Error("Value must be a number");
  }
  return value;
}

/**
 * A runtime checker that ensures a given value is an array
 *
 * This is used when you want to verify that data at runtime matches the expected type.
 * This implies assertSet.
 */
export function assertArray<T>(value: readonly T[]): readonly T[] {
  assertSet(value);
  if (!Array.isArray(value as unknown)) {
    throw new Error("Value must be a an array");
  }
  return value;
}

/**
 * A runtime checker that ensures a given value is an object in the sense of JSON
 * (an unordered collection of key–value pairs where the keys are strings)
 *
 * This is used when you want to verify that data at runtime matches the expected type.
 * This implies assertSet.
 */
export function assertObject<T>(value: T): T {
  assertSet(value);
  if (typeof (value as unknown) !== "object") {
    throw new Error("Value must be an object");
  }

  // Exclude special kind of objects like Array, Date or Uint8Array
  // Object.prototype.toString() returns a specified value:
  // http://www.ecma-international.org/ecma-262/7.0/index.html#sec-object.prototype.tostring
  if (Object.prototype.toString.call(value) !== "[object Object]") {
    throw new Error("Value must be a simple object");
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

export function dictionaryToStringMap(obj: any): Map<string, string> {
  const out = new Map<string, string>();
  for (const key of Object.keys(obj)) {
    const value: unknown = obj[key];
    if (typeof value !== "string") {
      throw new Error("Found dictionary value of type other than string");
    }
    out.set(key, value);
  }
  return out;
}

export class Integer {
  public static parse(input: IntegerString | number): number {
    const asInt = typeof input === "number" ? new Int53(input) : Int53.fromString(input);
    return asInt.toNumber();
  }

  public static encode(num: number): IntegerString {
    return new Int53(num).toString() as IntegerString;
  }
}

export class Base64 {
  public static encode(data: Uint8Array): Base64String {
    return toBase64(data) as Base64String;
  }

  public static decode(base64String: Base64String): Uint8Array {
    return fromBase64(base64String);
  }
}

export class DateTime {
  public static decode(dateTimeString: DateTimeString): ReadonlyDateWithNanoseconds {
    const readonlyDate = fromRfc3339(dateTimeString);
    const nanosecondsMatch = dateTimeString.match(/\.(\d+)Z$/);
    const nanoseconds = nanosecondsMatch ? nanosecondsMatch[1].slice(3) : "";
    // tslint:disable-next-line:no-object-mutation
    (readonlyDate as any).nanoseconds = parseInt(nanoseconds.padEnd(6, "0"), 10);
    return readonlyDate as ReadonlyDateWithNanoseconds;
  }
}

export class Hex {
  public static encode(data: Uint8Array): HexString {
    return toHex(data) as HexString;
  }

  public static decode(hexString: HexString): Uint8Array {
    return fromHex(hexString);
  }
}

// Encodings needed for hashing block headers
// Several of these functions are inspired by https://github.com/nomic-io/js-tendermint/blob/tendermint-0.30/src/

// See https://github.com/tendermint/go-amino/blob/v0.15.0/encoder.go#L193-L195
export function encodeString(s: string): Uint8Array {
  const utf8 = toUtf8(s);
  return Uint8Array.from([utf8.length, ...utf8]);
}

// See https://github.com/tendermint/go-amino/blob/v0.15.0/encoder.go#L79-L87
export function encodeInt(n: number): Uint8Array {
  // tslint:disable-next-line:no-bitwise
  return n >= 0x80 ? Uint8Array.from([(n & 0xff) | 0x80, ...encodeInt(n >> 7)]) : Uint8Array.from([n & 0xff]);
}

// See https://github.com/tendermint/go-amino/blob/v0.15.0/encoder.go#L134-L178
export function encodeTime(time: ReadonlyDateWithNanoseconds): Uint8Array {
  const milliseconds = time.getTime();
  const seconds = Math.floor(milliseconds / 1000);
  const secondsArray = seconds ? [0x08, ...encodeInt(seconds)] : new Uint8Array();
  const nanoseconds = (time.nanoseconds || 0) + (milliseconds % 1000) * 1e6;
  const nanosecondsArray = nanoseconds ? [0x10, ...encodeInt(nanoseconds)] : new Uint8Array();
  return Uint8Array.from([...secondsArray, ...nanosecondsArray]);
}

// See https://github.com/tendermint/go-amino/blob/v0.15.0/encoder.go#L180-L187
export function encodeBytes(bytes: Uint8Array): Uint8Array {
  // Since we're only dealing with short byte arrays we don't need a full VarBuffer implementation yet
  if (bytes.length >= 0x80) throw new Error("Not implemented for byte arrays of length 128 or more");
  return bytes.length ? Uint8Array.from([bytes.length, ...bytes]) : new Uint8Array();
}

export function encodeVersion(version: Version): Uint8Array {
  const blockArray = version.block ? Uint8Array.from([0x08, ...encodeInt(version.block)]) : new Uint8Array();
  const appArray = version.app ? Uint8Array.from([0x10, ...encodeInt(version.app)]) : new Uint8Array();
  return Uint8Array.from([...blockArray, ...appArray]);
}

export function encodeBlockId(blockId: BlockId): Uint8Array {
  return Uint8Array.from([
    0x0a,
    blockId.hash.length,
    ...blockId.hash,
    0x12,
    blockId.parts.hash.length + 4,
    0x08,
    blockId.parts.total,
    0x12,
    blockId.parts.hash.length,
    ...blockId.parts.hash,
  ]);
}
