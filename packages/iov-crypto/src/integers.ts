/* tslint:disable:no-bitwise */

export class Uint32 {
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
