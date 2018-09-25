import { Int53, Uint32, Uint64 } from "./integers";

describe("Integers", () => {
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

  describe("Uint64", () => {
    it("can be constructed from number", () => {
      expect(new Uint64(0)).toBeTruthy();
      expect(new Uint64(1)).toBeTruthy();
      expect(new Uint64(42)).toBeTruthy();
      expect(new Uint64(1000000000)).toBeTruthy();
      expect(new Uint64(2147483647)).toBeTruthy();
      expect(new Uint64(2147483648)).toBeTruthy();
      expect(new Uint64(4294967295)).toBeTruthy();
      expect(new Uint64(4294967296)).toBeTruthy();
      expect(new Uint64(Number.MAX_SAFE_INTEGER)).toBeTruthy();
    });

    it("can be constructed component-wise", () => {
      expect(new Uint64({ high: new Uint32(0), low: new Uint32(0) })).toBeTruthy();
      expect(new Uint64({ high: new Uint32(0), low: new Uint32(1) })).toBeTruthy();
      expect(new Uint64({ high: new Uint32(1), low: new Uint32(0) })).toBeTruthy();
      expect(new Uint64({ high: new Uint32(1), low: new Uint32(1) })).toBeTruthy();
    });

    it("throws for values out of range", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Uint64(-1)).toThrowError(/not in uint64 range/);
      expect(() => new Uint64(Number.MIN_SAFE_INTEGER)).toThrowError(/not in uint64 range/);
      expect(() => new Uint64(Number.NEGATIVE_INFINITY)).toThrowError(/not in uint64 range/);

      expect(() => new Uint64(Number.MAX_SAFE_INTEGER + 1)).toThrowError(/too large for number constructor/);
      expect(() => new Uint64(2 ** 64)).toThrowError(/too large for number constructor/);
      expect(() => new Uint64(Number.POSITIVE_INFINITY)).toThrowError(/too large for number constructor/);

      // tslint:enable:no-unused-expression
    });

    it("throws for invald numbers", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Uint64(NaN)).toThrowError(/not a number/);

      // tslint:enable:no-unused-expression
    });

    it("can convert to number", () => {
      expect(new Uint64({ high: new Uint32(0), low: new Uint32(0) }).asNumber()).toEqual(0 * 2 ** 32 + 0);
      expect(new Uint64({ high: new Uint32(0), low: new Uint32(1) }).asNumber()).toEqual(0 * 2 ** 32 + 1);
      expect(new Uint64({ high: new Uint32(0), low: new Uint32(4294967295) }).asNumber()).toEqual(0 * 2 ** 32 + 4294967295);
      expect(new Uint64({ high: new Uint32(1), low: new Uint32(0) }).asNumber()).toEqual(1 * 2 ** 32);
      expect(new Uint64({ high: new Uint32(1), low: new Uint32(1) }).asNumber()).toEqual(1 * 2 ** 32 + 1);
      expect(new Uint64({ high: new Uint32(2), low: new Uint32(0) }).asNumber()).toEqual(2 * 2 ** 32 + 0);
      expect(new Uint64({ high: new Uint32(2), low: new Uint32(1) }).asNumber()).toEqual(2 * 2 ** 32 + 1);
      expect(new Uint64({ high: new Uint32(3333), low: new Uint32(0) }).asNumber()).toEqual(3333 * 2 ** 32 + 0);
      expect(new Uint64({ high: new Uint32(3333), low: new Uint32(1) }).asNumber()).toEqual(3333 * 2 ** 32 + 1);
      expect(new Uint64({ high: new Uint32(2097151), low: new Uint32(4294967295) }).asNumber()).toEqual(Number.MAX_SAFE_INTEGER);

      // MAX_SAFE_INTEGER+1
      expect(() => new Uint64({ high: new Uint32(2097152), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);

      // set 11 highest bits
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x80, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x40, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x20, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x10, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x08, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x04, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x02, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x01, 0x00, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x00, 0x80, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x00, 0x40, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
      expect(() => new Uint64({ high: Uint32.fromBigEndianBytes([0x00, 0x20, 0x00, 0x00]), low: new Uint32(0) }).asNumber()).toThrowError(/value too large to be represented as number/i);
    });

    it("can convert to byte array", () => {
      expect(new Uint64(0).toBytesBigEndian()).toEqual([0, 0, 0, 0, 0, 0, 0, 0]);
      expect(new Uint64(1).toBytesBigEndian()).toEqual([0, 0, 0, 0, 0, 0, 0, 1]);
      expect(new Uint64(42).toBytesBigEndian()).toEqual([0, 0, 0, 0, 0, 0, 0, 42]);
      expect(new Uint64(1000000000).toBytesBigEndian()).toEqual([0, 0, 0, 0, 0x3b, 0x9a, 0xca, 0x00]);
      expect(new Uint64(2147483647).toBytesBigEndian()).toEqual([0, 0, 0, 0, 0x7f, 0xff, 0xff, 0xff]);
      expect(new Uint64(2147483648).toBytesBigEndian()).toEqual([0, 0, 0, 0, 0x80, 0x00, 0x00, 0x00]);
      expect(new Uint64(4294967295).toBytesBigEndian()).toEqual([0, 0, 0, 0, 0xff, 0xff, 0xff, 0xff]);
    });

    it("can convert to string", () => {
      expect(new Uint64(0).toString()).toEqual("0");
      expect(new Uint64(1).toString()).toEqual("1");
      expect(new Uint64(42).toString()).toEqual("42");
      expect(new Uint64(1000000000).toString()).toEqual("1000000000");
      expect(new Uint64(2147483647).toString()).toEqual("2147483647");
      expect(new Uint64(2147483648).toString()).toEqual("2147483648");
      expect(new Uint64(4294967295).toString()).toEqual("4294967295");
      expect(new Uint64(Number.MAX_SAFE_INTEGER).toString()).toEqual("9007199254740991");
      expect(Uint64.fromBigEndianBytes([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]).toString()).toEqual("18446744073709551615");
    });

    describe("fromBigEndianBytes", () => {
      it("can be constructed from to byte array", () => {
        expect(Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, 0]).asNumber()).toEqual(0);
        expect(Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, 1]).asNumber()).toEqual(1);
        expect(Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, 42]).asNumber()).toEqual(42);
        expect(Uint64.fromBigEndianBytes([0x00, 0x00, 0x00, 0x00, 0x3b, 0x9a, 0xca, 0x00]).asNumber()).toEqual(1000000000);
        expect(Uint64.fromBigEndianBytes([0x00, 0x00, 0x00, 0x00, 0x7f, 0xff, 0xff, 0xff]).asNumber()).toEqual(2147483647);
        expect(Uint64.fromBigEndianBytes([0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00]).asNumber()).toEqual(2147483648);
        expect(Uint64.fromBigEndianBytes([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff]).asNumber()).toEqual(4294967295);
        expect(Uint64.fromBigEndianBytes([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00]).asNumber()).toEqual(4294967296);
      });

      it("can be constructed from Buffer", () => {
        expect(Uint64.fromBigEndianBytes(Buffer.from([0, 0, 0, 0, 0, 0, 0, 0])).asNumber()).toEqual(0);
        expect(Uint64.fromBigEndianBytes(Buffer.from([0, 0, 0, 0, 0, 0, 0, 1])).asNumber()).toEqual(1);
        expect(Uint64.fromBigEndianBytes(Buffer.from([0, 0, 0, 0, 0, 0, 0, 42])).asNumber()).toEqual(42);
        expect(Uint64.fromBigEndianBytes(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x3b, 0x9a, 0xca, 0x00])).asNumber()).toEqual(1000000000);
        expect(Uint64.fromBigEndianBytes(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x7f, 0xff, 0xff, 0xff])).asNumber()).toEqual(2147483647);
        expect(Uint64.fromBigEndianBytes(Buffer.from([0x00, 0x00, 0x00, 0x00, 0x80, 0x00, 0x00, 0x00])).asNumber()).toEqual(2147483648);
        expect(Uint64.fromBigEndianBytes(Buffer.from([0x00, 0x00, 0x00, 0x00, 0xff, 0xff, 0xff, 0xff])).asNumber()).toEqual(4294967295);
        expect(Uint64.fromBigEndianBytes(Buffer.from([0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00])).asNumber()).toEqual(4294967296);
      });

      it("throws for invalid input length", () => {
        expect(() => Uint64.fromBigEndianBytes([])).toThrowError(/Invalid input length/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0])).toThrowError(/Invalid input length/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0])).toThrowError(/Invalid input length/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0])).toThrowError(/Invalid input length/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0])).toThrowError(/Invalid input length/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0])).toThrowError(/Invalid input length/);

        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, 0, 0])).toThrowError(/Invalid input length/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, 0, 0, 0])).toThrowError(/Invalid input length/);
      });

      it("throws for invalid values", () => {
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, -1])).toThrowError(/Invalid value in byte/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, 256])).toThrowError(/Invalid value in byte/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, NaN])).toThrowError(/Invalid value in byte/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, Number.NEGATIVE_INFINITY])).toThrowError(/Invalid value in byte/);
        expect(() => Uint64.fromBigEndianBytes([0, 0, 0, 0, 0, 0, 0, Number.POSITIVE_INFINITY])).toThrowError(/Invalid value in byte/);
      });
    });
  });

  describe("Int53", () => {
    it("can be constructed", () => {
      expect(new Int53(0)).toBeTruthy();
      expect(new Int53(1)).toBeTruthy();
      expect(new Int53(42)).toBeTruthy();
      expect(new Int53(1000000000)).toBeTruthy();
      expect(new Int53(2147483647)).toBeTruthy();
      expect(new Int53(2147483648)).toBeTruthy();
      expect(new Int53(4294967295)).toBeTruthy();
      expect(new Int53(9007199254740991)).toBeTruthy();

      expect(new Int53(-1)).toBeTruthy();
      expect(new Int53(-42)).toBeTruthy();
      expect(new Int53(-2147483648)).toBeTruthy();
      expect(new Int53(-2147483649)).toBeTruthy();
      expect(new Int53(-9007199254740991)).toBeTruthy();
    });

    it("throws for values out of range", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Int53(Number.MIN_SAFE_INTEGER - 1)).toThrowError(/not in int53 range/);
      expect(() => new Int53(Number.MAX_SAFE_INTEGER + 1)).toThrowError(/not in int53 range/);
      expect(() => new Int53(Number.NEGATIVE_INFINITY)).toThrowError(/not in int53 range/);
      expect(() => new Int53(Number.POSITIVE_INFINITY)).toThrowError(/not in int53 range/);

      // tslint:enable:no-unused-expression
    });

    it("throws for invald numbers", () => {
      // tslint:disable:no-unused-expression

      expect(() => new Int53(NaN)).toThrowError(/not a number/);

      // tslint:enable:no-unused-expression
    });

    it("can convert to number", () => {
      expect(new Int53(0).asNumber()).toEqual(0);
      expect(new Int53(1).asNumber()).toEqual(1);
      expect(new Int53(42).asNumber()).toEqual(42);
      expect(new Int53(1000000000).asNumber()).toEqual(1000000000);
      expect(new Int53(2147483647).asNumber()).toEqual(2147483647);
      expect(new Int53(2147483648).asNumber()).toEqual(2147483648);
      expect(new Int53(4294967295).asNumber()).toEqual(4294967295);
      expect(new Int53(9007199254740991).asNumber()).toEqual(9007199254740991);

      expect(new Int53(-1).asNumber()).toEqual(-1);
      expect(new Int53(-9007199254740991).asNumber()).toEqual(-9007199254740991);
    });

    it("can convert to string", () => {
      expect(new Int53(0).asString()).toEqual("0");
      expect(new Int53(1).asString()).toEqual("1");
      expect(new Int53(42).asString()).toEqual("42");
      expect(new Int53(1000000000).asString()).toEqual("1000000000");
      expect(new Int53(2147483647).asString()).toEqual("2147483647");
      expect(new Int53(2147483648).asString()).toEqual("2147483648");
      expect(new Int53(4294967295).asString()).toEqual("4294967295");
      expect(new Int53(9007199254740991).asString()).toEqual("9007199254740991");

      expect(new Int53(-1).asString()).toEqual("-1");
      expect(new Int53(-9007199254740991).asString()).toEqual("-9007199254740991");
    });

    it("can be constructed from string", () => {
      expect(Int53.fromString("0").asString()).toEqual("0");
      expect(Int53.fromString("1").asString()).toEqual("1");
      expect(Int53.fromString("9007199254740991").asString()).toEqual("9007199254740991");

      expect(Int53.fromString("-1").asString()).toEqual("-1");
      expect(Int53.fromString("-9007199254740991").asString()).toEqual("-9007199254740991");
    });

    it("throws for invalid string format", () => {
      // tslint:disable:no-unused-expression

      expect(() => Int53.fromString(" 0")).toThrowError(/invalid string format/i);
      expect(() => Int53.fromString("+0")).toThrowError(/invalid string format/i);
      expect(() => Int53.fromString("1e6")).toThrowError(/invalid string format/i);

      // tslint:enable:no-unused-expression
    });
  });
});
