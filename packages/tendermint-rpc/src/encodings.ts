import { Buffer } from "buffer";
import { isNumber } from "util";

declare class As<Tag extends string> {
  private readonly "_ _ _": Tag;
}

export type Base64String = string & As<"base64">;
export type HexString = string & As<"hex">;
export type IpPortString = string & As<"ipport">;
export type DateTimeString = string & As<"datetime">;

interface Lengther {
  readonly length: number;
}

// required can be used to anywhere to throw errors if missing before
// encoding/decoding. Works with anything with strings, arrays, or numbers
export function required<T extends Lengther | number>(value: T | undefined, notEmpty?: boolean): T {
  if (value === undefined) {
    throw new Error("must provide a value");
  } else if (notEmpty) {
    if (isNumber(value) && value === 0) {
      throw new Error("must provide a non-zero value");
    } else if ((value as Lengther).length === 0) {
      throw new Error("must provide a non-empty value");
    }
  }
  return value;
}

// optional uses the value or provides a default
export function optional<T>(value: T | undefined, fallback: T): T {
  return value || fallback;
}

export class Hex {
  // encode hex-encodes whatever data was provided
  public static encode(data: Uint8Array): HexString {
    const buf = new Buffer(data);
    return buf.toString("hex") as HexString;
  }

  public static decode(hexstring: HexString): Uint8Array {
    return new Buffer(hexstring, "hex");
  }

  // do we need these???

  // mustEncode throws an error if data was not provided,
  // notEmpty requires that the value is not []
  public static mustEncode(data?: Uint8Array, notEmpty?: boolean): HexString {
    return this.encode(required(data, notEmpty));
  }

  // may encode returns "" if data was not provided
  public static mayEncode(data?: Uint8Array): HexString {
    return this.encode(optional(data, new Uint8Array([])));
  }

  // mustDecode throws an error if data was not provided,
  // notEmpty requires that the value is not ""
  public static mustDecode(hexstring?: HexString, notEmpty?: boolean): Uint8Array {
    return this.decode(required(hexstring, notEmpty));
  }

  // may Decode returns "" if hexstring was not provided
  public static mayDecode(hexstring?: HexString): Uint8Array {
    return this.decode(optional(hexstring, "" as HexString));
  }
}

export class Base64 {
  public static encode(data: Uint8Array): Base64String {
    const buf = new Buffer(data);
    return buf.toString("base64") as Base64String;
  }

  public static decode(base64String: Base64String): Uint8Array {
    return new Buffer(base64String, "base64");
  }
}
