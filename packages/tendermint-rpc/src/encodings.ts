declare class As<Tag extends string> {
  private readonly "_ _ _": Tag;
}

export type Base64String = string & As<"base64">;
export type HexString = string & As<"hex">;
export type IpPortString = string & As<"ipport">;
export type DateTimeString = string & As<"datetime">;

// Note some code is copied from iov-crypto/encoding,
// but I didn't want to consider iov-crypto a requirement...
// Better way to do this?
export class Hex {
  // mustEncode throws an error if data was not provided,
  // notEmpty requires that the value is not []
  public static mustEncode(data?: Uint8Array, notEmpty?: boolean): HexString {
    if (data === undefined) {
      throw new Error("must provide a value");
    } else if (notEmpty && data.length === 0) {
      throw new Error("must provide a non-empty value");
    }
    return this.encode(data);
  }

  // may encode returns "" if data was not provided
  public static mayEncode(data?: Uint8Array): HexString {
    if (data === undefined) {
      return "" as HexString;
    }
    return this.encode(data);
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
    if (hexstring === undefined) {
      throw new Error("must provide a value");
    } else if (notEmpty && hexstring.length === 0) {
      throw new Error("must provide a non-empty value");
    }
    return this.decode(hexstring);
  }

  // may Decode returns "" if hexstring was not provided
  public static mayDecode(hexstring?: HexString): Uint8Array {
    if (hexstring === undefined) {
      return new Uint8Array([]);
    }
    return this.decode(hexstring);
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
