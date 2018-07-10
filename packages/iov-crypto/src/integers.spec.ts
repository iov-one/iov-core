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

    expect(() => new Uint32(-1)).toThrowError(/not in uint32 range/);
    expect(() => new Uint32(4294967296)).toThrowError(/not in uint32 range/);
    expect(() => new Uint32(Number.MIN_SAFE_INTEGER)).toThrowError(/not in uint32 range/);
    expect(() => new Uint32(Number.MAX_SAFE_INTEGER)).toThrowError(/not in uint32 range/);
    expect(() => new Uint32(Number.NEGATIVE_INFINITY)).toThrowError(/not in uint32 range/);
    expect(() => new Uint32(Number.POSITIVE_INFINITY)).toThrowError(/not in uint32 range/);

    // tslint:enable:no-unused-expression
  });

  it("throws for invald numbers", () => {
    // tslint:disable:no-unused-expression

    expect(() => new Uint32(NaN)).toThrowError(/not a number/);

    // tslint:enable:no-unused-expression
  });

  it("can convert back to number", () => {
    expect(new Uint32(0).asNumber()).toEqual(0);
    expect(new Uint32(1).asNumber()).toEqual(1);
    expect(new Uint32(42).asNumber()).toEqual(42);
    expect(new Uint32(1000000000).asNumber()).toEqual(1000000000);
    expect(new Uint32(2147483647).asNumber()).toEqual(2147483647);
    expect(new Uint32(2147483648).asNumber()).toEqual(2147483648);
    expect(new Uint32(4294967295).asNumber()).toEqual(4294967295);
  });

  it("can convert to byte array", () => {
    expect(new Uint32(0).toBytesBigEndian()).toEqual([0, 0, 0, 0]);
    expect(new Uint32(1).toBytesBigEndian()).toEqual([0, 0, 0, 1]);
    expect(new Uint32(42).toBytesBigEndian()).toEqual([0, 0, 0, 42]);
    expect(new Uint32(1000000000).toBytesBigEndian()).toEqual([0x3b, 0x9a, 0xca, 0x00]);
    expect(new Uint32(2147483647).toBytesBigEndian()).toEqual([0x7f, 0xff, 0xff, 0xff]);
    expect(new Uint32(2147483648).toBytesBigEndian()).toEqual([0x80, 0x00, 0x00, 0x00]);
    expect(new Uint32(4294967295).toBytesBigEndian()).toEqual([0xff, 0xff, 0xff, 0xff]);
  });

  describe("fromBigEndianBytes", () => {
    it("can be constructed from to byte array", () => {
      expect(Uint32.fromBigEndianBytes([0, 0, 0, 0]).asNumber()).toEqual(0);
      expect(Uint32.fromBigEndianBytes([0, 0, 0, 1]).asNumber()).toEqual(1);
      expect(Uint32.fromBigEndianBytes([0, 0, 0, 42]).asNumber()).toEqual(42);
      expect(Uint32.fromBigEndianBytes([0x3b, 0x9a, 0xca, 0x00]).asNumber()).toEqual(1000000000);
      expect(Uint32.fromBigEndianBytes([0x7f, 0xff, 0xff, 0xff]).asNumber()).toEqual(2147483647);
      expect(Uint32.fromBigEndianBytes([0x80, 0x00, 0x00, 0x00]).asNumber()).toEqual(2147483648);
      expect(Uint32.fromBigEndianBytes([0xff, 0xff, 0xff, 0xff]).asNumber()).toEqual(4294967295);
    });

    it("can be constructed from Buffer", () => {
      expect(Uint32.fromBigEndianBytes(Buffer.from([0, 0, 0, 0])).asNumber()).toEqual(0);
      expect(Uint32.fromBigEndianBytes(Buffer.from([0, 0, 0, 1])).asNumber()).toEqual(1);
      expect(Uint32.fromBigEndianBytes(Buffer.from([0, 0, 0, 42])).asNumber()).toEqual(42);
      expect(Uint32.fromBigEndianBytes(Buffer.from([0x3b, 0x9a, 0xca, 0x00])).asNumber()).toEqual(1000000000);
      expect(Uint32.fromBigEndianBytes(Buffer.from([0x7f, 0xff, 0xff, 0xff])).asNumber()).toEqual(2147483647);
      expect(Uint32.fromBigEndianBytes(Buffer.from([0x80, 0x00, 0x00, 0x00])).asNumber()).toEqual(2147483648);
      expect(Uint32.fromBigEndianBytes(Buffer.from([0xff, 0xff, 0xff, 0xff])).asNumber()).toEqual(4294967295);
    });

    it("throws for invalid input length", () => {
      expect(() => Uint32.fromBigEndianBytes([])).toThrowError(/Invalid input length/);
      expect(() => Uint32.fromBigEndianBytes([0, 0, 0])).toThrowError(/Invalid input length/);
      expect(() => Uint32.fromBigEndianBytes([0, 0, 0, 0, 0])).toThrowError(/Invalid input length/);
    });

    it("throws for invalid values", () => {
      expect(() => Uint32.fromBigEndianBytes([0, 0, 0, -1])).toThrowError(/Invalid value in byte/);
      expect(() => Uint32.fromBigEndianBytes([0, 0, 0, 256])).toThrowError(/Invalid value in byte/);
      expect(() => Uint32.fromBigEndianBytes([0, 0, 0, NaN])).toThrowError(/Invalid value in byte/);
      expect(() => Uint32.fromBigEndianBytes([0, 0, 0, Number.NEGATIVE_INFINITY])).toThrowError(/Invalid value in byte/);
      expect(() => Uint32.fromBigEndianBytes([0, 0, 0, Number.POSITIVE_INFINITY])).toThrowError(/Invalid value in byte/);
    });
  });
});
