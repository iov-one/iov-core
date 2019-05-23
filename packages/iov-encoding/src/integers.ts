/* tslint:disable:no-bitwise */
import BN = require("bn.js");

const uint64MaxValue = new BN("18446744073709551615", 10, "be");

// internal interface to ensure all integer types can be used equally
interface Integer {
  readonly toNumber: () => number;
  readonly toString: () => string;
}

export class Uint32 implements Integer {
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
      throw new Error("Input is not a number");
    }

    if (!Number.isInteger(input)) {
      throw new Error("Input is not an integer");
    }

    if (input < 0 || input > 4294967295) {
      throw new Error("Input not in uint32 range: " + input.toString());
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

  public toNumber(): number {
    return this.data;
  }

  public toString(): string {
    return this.data.toString();
  }
}

export class Int53 implements Integer {
  public static fromString(str: string): Int53 {
    if (!str.match(/^-?[0-9]+$/)) {
      throw new Error("Invalid string format");
    }

    return new Int53(Number.parseInt(str, 10));
  }

  protected readonly data: number;

  constructor(input: number) {
    if (Number.isNaN(input)) {
      throw new Error("Input is not a number");
    }

    if (!Number.isInteger(input)) {
      throw new Error("Input is not an integer");
    }

    if (input < Number.MIN_SAFE_INTEGER || input > Number.MAX_SAFE_INTEGER) {
      throw new Error("Input not in int53 range: " + input.toString());
    }

    this.data = input;
  }

  public toNumber(): number {
    return this.data;
  }

  public toString(): string {
    return this.data.toString();
  }
}

export class Uint53 implements Integer {
  public static fromString(str: string): Uint53 {
    const signed = Int53.fromString(str);
    return new Uint53(signed.toNumber());
  }

  protected readonly data: Int53;

  constructor(input: number) {
    const signed = new Int53(input);
    if (signed.toNumber() < 0) {
      throw new Error("Input is negative");
    }
    this.data = signed;
  }

  public toNumber(): number {
    return this.data.toNumber();
  }

  public toString(): string {
    return this.data.toString();
  }
}

export class Uint64 implements Integer {
  public static fromBytesBigEndian(bytes: ArrayLike<number>): Uint64 {
    if (bytes.length !== 8) {
      throw new Error("Invalid input length. Expected 8 bytes.");
    }

    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < bytes.length; ++i) {
      if (bytes[i] > 255 || bytes[i] < 0 || Number.isNaN(bytes[i])) {
        throw new Error("Invalid value in byte. Found: " + bytes[i]);
      }
    }

    // tslint:disable-next-line:readonly-array
    const asArray: number[] = [];
    // tslint:disable-next-line:prefer-for-of
    for (let i = 0; i < bytes.length; ++i) {
      asArray.push(bytes[i]);
    }

    return new Uint64(new BN([...asArray]));
  }

  public static fromString(str: string): Uint64 {
    if (!str.match(/^[0-9]+$/)) {
      throw new Error("Invalid string format");
    }
    return new Uint64(new BN(str, 10, "be"));
  }

  public static fromNumber(input: number): Uint64 {
    if (Number.isNaN(input)) {
      throw new Error("Input is not a number");
    }

    let bigint: BN;
    try {
      bigint = new BN(input);
    } catch {
      throw new Error("Input is not a safe integer");
    }
    return new Uint64(bigint);
  }

  private readonly data: BN;

  private constructor(data: BN) {
    if (data.isNeg()) {
      throw new Error("Input is negative");
    }
    if (data.gt(uint64MaxValue)) {
      throw new Error("Input exceeds uint64 range");
    }
    this.data = data;
  }

  public toBytesBigEndian(): ReadonlyArray<number> {
    return this.data.toArray("be", 8);
  }

  public toBytesLittleEndian(): ReadonlyArray<number> {
    return this.data.toArray("le", 8);
  }

  public toString(): string {
    return this.data.toString(10);
  }

  public toNumber(): number {
    return this.data.toNumber();
  }
}
