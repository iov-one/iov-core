/* tslint:disable:no-bitwise */

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
