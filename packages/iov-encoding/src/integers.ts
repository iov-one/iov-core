/* tslint:disable:no-bitwise */
import BN = require("bn.js");

export class Uint32 {
  public static fromBigEndianBytes(bytes: ArrayLike<number>): Uint32 {
    if (bytes.length !== 4) {
      throw new Error("Invalid input length. Expected 4 bytes.");
    }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < bytes.length; ++i) {
      if (bytes[i] > 255 || bytes[i] < 0 || Number.isNaN(bytes[i])) {
        throw new Error("Invalid value in byte. Found: " + bytes[i]);
      }
    }

    // Use mulitiplication instead of shifting since bitwise operators are defined
    // on SIGNED int32 in JavaScript and we don't want to risk surprises
    return new Uint32(bytes[0] * 2 ** 24 + bytes[1] * 2 ** 16 + bytes[2] * 2 ** 8 + bytes[3]);
  }

  protected readonly data: number;

  constructor(input: number) {
    if (Number.isNaN(input)) {
      throw new Error("input is not a number");
    }

    if (input < 0 || input > 4294967295) {
      throw new Error("input not in uint32 range: " + input.toString());
    }

    this.data = input;
  }

  public toBytesBigEndian(): ReadonlyArray<number> {
    // Use division instead of shifting since bitwise operators are defined
    // on SIGNED int32 in JavaScript and we don't want to risk surprises
    return [
      Math.floor(this.data / 2 ** 24) & 0xff,
      Math.floor(this.data / 2 ** 16) & 0xff,
      Math.floor(this.data / 2 ** 8) & 0xff,
      Math.floor(this.data / 2 ** 0) & 0xff,
    ];
  }

  public asNumber(): number {
    return this.data;
  }
}

export interface Uint64Components {
  readonly high: Uint32;
  readonly low: Uint32;
}

export class Uint64 {
  public static fromString(str: string): Uint64 {
    if (!str.match(/^[0-9]+$/)) {
      throw new Error("Invalid string format");
    }

    const bigNumber = new BN(str, 10);
    const maxUint64 = new BN("ffffffffffffffff", "hex");
    if (bigNumber.gt(maxUint64)) {
      throw new Error("Value exceeds uint64 range");
    }

    return Uint64.fromBigEndianBytes(bigNumber.toArray("be", 8));
  }

  public static fromBigEndianBytes(bytes: ArrayLike<number>): Uint64 {
    if (bytes.length !== 8) {
      throw new Error("Invalid input length. Expected 8 bytes.");
    }

    return new Uint64({
      high: Uint32.fromBigEndianBytes([bytes[0], bytes[1], bytes[2], bytes[3]]),
      low: Uint32.fromBigEndianBytes([bytes[4], bytes[5], bytes[6], bytes[7]]),
    });
  }

  protected readonly high: Uint32;
  protected readonly low: Uint32;

  constructor(input: number | Uint64Components) {
    if (typeof input === "number") {
      if (Number.isNaN(input)) {
        throw new Error("input is not a number");
      }

      if (input < 0) {
        throw new Error("input not in uint64 range: " + input.toString());
      }

      if (input > Number.MAX_SAFE_INTEGER) {
        throw new Error("input too large for number constructor: " + input.toString());
      }

      this.high = new Uint32(Math.floor(input / 2 ** 32));
      this.low = new Uint32(input % 2 ** 32);
    } else {
      this.high = input.high;
      this.low = input.low;
    }
  }

  public toBytesBigEndian(): ReadonlyArray<number> {
    return [...this.high.toBytesBigEndian(), ...this.low.toBytesBigEndian()];
  }

  public asNumber(): number {
    // largest integer that can be represented as a number without losses is
    // 9007199254740991 = 00 1f ff ff ff ff ff ff_16,
    //                  = 0000 0000 0001 1111 1111 1111 1111 1111_2,
    // i.e. the first eleven bits must be 0
    const highBytes = this.high.toBytesBigEndian();
    if (highBytes[0] !== 0x00 || highBytes[1] > 0x1f) {
      throw new Error("Value too large to be represented as number");
    }

    return this.high.asNumber() * 2 ** 32 + this.low.asNumber();
  }

  public toString(): string {
    const bigNumber = new BN(new Uint8Array(this.toBytesBigEndian()));
    return bigNumber.toString(10);
  }
}

export class Int53 {
  public static fromString(str: string): Int53 {
    if (!str.match(/^\-?[0-9]+$/)) {
      throw new Error("Invalid string format");
    }

    return new Int53(Number.parseInt(str, 10));
  }

  protected readonly data: number;

  constructor(input: number) {
    if (Number.isNaN(input)) {
      throw new Error("input is not a number");
    }

    if (input < Number.MIN_SAFE_INTEGER || input > Number.MAX_SAFE_INTEGER) {
      throw new Error("input not in int53 range: " + input.toString());
    }

    this.data = input;
  }

  public asNumber(): number {
    return this.data;
  }

  public asString(): string {
    return this.data.toString();
  }
}
