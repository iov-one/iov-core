import { Uint32 } from "./integers";

describe("Uint32", () => {
  it("can be constructed", () => {
    expect(new Uint32(0)).toBeTruthy();
    expect(new Uint32(1)).toBeTruthy();
    expect(new Uint32(42)).toBeTruthy();
    expect(new Uint32(1000000000)).toBeTruthy();
    expect(new Uint32(2147483647)).toBeTruthy();
    expect(new Uint32(2147483648)).toBeTruthy();
    expect(new Uint32(4294967295)).toBeTruthy();
  });

  it("throws for values out of range", () => {
    // tslint:disable:no-unused-expression

    expect(() => {
      new Uint32(-1);
    }).toThrowError(/not in uint32 range/);
    expect(() => {
      new Uint32(4294967296);
    }).toThrowError(/not in uint32 range/);
    expect(() => {
      new Uint32(Number.MIN_SAFE_INTEGER);
    }).toThrowError(/not in uint32 range/);
    expect(() => {
      new Uint32(Number.MAX_SAFE_INTEGER);
    }).toThrowError(/not in uint32 range/);
    expect(() => {
      new Uint32(Number.NEGATIVE_INFINITY);
    }).toThrowError(/not in uint32 range/);
    expect(() => {
      new Uint32(Number.POSITIVE_INFINITY);
    }).toThrowError(/not in uint32 range/);

    // tslint:enable:no-unused-expression
  });
});
