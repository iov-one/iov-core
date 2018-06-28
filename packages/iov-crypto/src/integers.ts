import Long = require("long");

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
    const bytes = Long.fromInt(this.data).toBytesBE();
    if (bytes.length !== 8) {
      throw new Error("Panic! Long is not 8 bytes long.");
    }
    return bytes.slice(4, 8);
  }

  public asNumber(): number {
    return this.data;
  }
}
