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

// must can be used to anywhere to throw errors if missing before
// encoding/decoding
function must<T extends Lengther>(value: T | undefined, notEmpty?: boolean): T {
  if (value === undefined) {
    throw new Error("must provide a value");
  } else if (notEmpty && value.length === 0) {
    throw new Error("must provide a non-empty value");
  }
  return value;
}

// maybe uses the value or provides a default
function maybe<T>(value: T | undefined, fallback: T): T {
  return value || fallback;
}

const emptyBytes = new Uint8Array([]);

// Note some code is copied from iov-crypto/encoding,
// but I didn't want to consider iov-crypto a requirement...
// Better way to do this?
export class Hex {
  // mustEncode throws an error if data was not provided,
  // notEmpty requires that the value is not []
  public static mustEncode(data?: Uint8Array, notEmpty?: boolean): HexString {
    return this.encode(must(data, notEmpty));
  }

  // may encode returns "" if data was not provided
  public static mayEncode(data?: Uint8Array): HexString {
    return this.encode(maybe(data, emptyBytes));
  }

  // encode hex-encodes whatever data was provided
  public static encode(data: Uint8Array): HexString {
    // tslint:disable-next-line:no-let
    let out: string = "";
    for (const byte of data) {
      out += ("0" + byte.toString(16)).slice(-2);
    }
    return out as HexString;
  }

  // mustDecode throws an error if data was not provided,
  // notEmpty requires that the value is not ""
  public static mustDecode(hexstring?: HexString, notEmpty?: boolean): Uint8Array {
    return this.decode(must(hexstring, notEmpty));
  }

  // may Decode returns "" if hexstring was not provided
  public static mayDecode(hexstring?: HexString): Uint8Array {
    return this.decode(maybe(hexstring, "" as HexString));
  }

  public static decode(hexstring: HexString): Uint8Array {
    if (hexstring.length % 2 !== 0) {
      throw new Error("hex string length must be a multiple of 2");
    }

    // tslint:disable-next-line:readonly-array
    const listOfInts: number[] = [];
    // tslint:disable-next-line:no-let
    for (let i = 0; i < hexstring.length; i += 2) {
      const hexByteAsString = hexstring.substr(i, 2);
      if (!hexByteAsString.match(/[0-9a-f]{2}/i)) {
        throw new Error("hex string contains invalid characters");
      }
      listOfInts.push(parseInt(hexByteAsString, 16));
    }
    return new Uint8Array(listOfInts);
  }
}
