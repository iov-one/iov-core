import { Decimal } from "./decimal";

describe("Decimal", () => {
  describe("fromUserInput", () => {
    it("throws helpful error message for invalid characters", () => {
      expect(() => Decimal.fromUserInput(" 13", 5)).toThrowError(/invalid character at position 1/i);
      expect(() => Decimal.fromUserInput("1,3", 5)).toThrowError(/invalid character at position 2/i);
      expect(() => Decimal.fromUserInput("13-", 5)).toThrowError(/invalid character at position 3/i);
      expect(() => Decimal.fromUserInput("13/", 5)).toThrowError(/invalid character at position 3/i);
      expect(() => Decimal.fromUserInput("13\\", 5)).toThrowError(/invalid character at position 3/i);
    });

    it("throws for more than one separators", () => {
      expect(() => Decimal.fromUserInput("1.3.5", 5)).toThrowError(/more than one separator found/i);
      expect(() => Decimal.fromUserInput("1..3", 5)).toThrowError(/more than one separator found/i);
    });

    it("throws for more fractional digits than supported", () => {
      expect(() => Decimal.fromUserInput("44.123456", 5)).toThrowError(
        /got more fractional digits than supported/i,
      );
      expect(() => Decimal.fromUserInput("44.1", 0)).toThrowError(
        /got more fractional digits than supported/i,
      );
    });

    it("throws for fractional digits that are not non-negative integers", () => {
      // no integer
      expect(() => Decimal.fromUserInput("1", Number.NaN)).toThrowError(
        /fractional digits is not an integer/i,
      );
      expect(() => Decimal.fromUserInput("1", Number.POSITIVE_INFINITY)).toThrowError(
        /fractional digits is not an integer/i,
      );
      expect(() => Decimal.fromUserInput("1", Number.NEGATIVE_INFINITY)).toThrowError(
        /fractional digits is not an integer/i,
      );
      expect(() => Decimal.fromUserInput("1", 1.78945544484)).toThrowError(
        /fractional digits is not an integer/i,
      );

      // negative
      expect(() => Decimal.fromUserInput("1", -1)).toThrowError(/fractional digits must not be negative/i);
      expect(() => Decimal.fromUserInput("1", Number.MIN_SAFE_INTEGER)).toThrowError(
        /fractional digits must not be negative/i,
      );
    });

    it("returns correct value", () => {
      expect(Decimal.fromUserInput("44", 0).atomics).toEqual("44");
      expect(Decimal.fromUserInput("44", 1).atomics).toEqual("440");
      expect(Decimal.fromUserInput("44", 2).atomics).toEqual("4400");
      expect(Decimal.fromUserInput("44", 3).atomics).toEqual("44000");

      expect(Decimal.fromUserInput("44.2", 1).atomics).toEqual("442");
      expect(Decimal.fromUserInput("44.2", 2).atomics).toEqual("4420");
      expect(Decimal.fromUserInput("44.2", 3).atomics).toEqual("44200");

      expect(Decimal.fromUserInput("44.1", 6).atomics).toEqual("44100000");
      expect(Decimal.fromUserInput("44.12", 6).atomics).toEqual("44120000");
      expect(Decimal.fromUserInput("44.123", 6).atomics).toEqual("44123000");
      expect(Decimal.fromUserInput("44.1234", 6).atomics).toEqual("44123400");
      expect(Decimal.fromUserInput("44.12345", 6).atomics).toEqual("44123450");
      expect(Decimal.fromUserInput("44.123456", 6).atomics).toEqual("44123456");
    });

    it("cuts leading zeros", () => {
      expect(Decimal.fromUserInput("4", 2).atomics).toEqual("400");
      expect(Decimal.fromUserInput("04", 2).atomics).toEqual("400");
      expect(Decimal.fromUserInput("004", 2).atomics).toEqual("400");
    });

    it("cuts tailing zeros", () => {
      expect(Decimal.fromUserInput("4.12", 5).atomics).toEqual("412000");
      expect(Decimal.fromUserInput("4.120", 5).atomics).toEqual("412000");
      expect(Decimal.fromUserInput("4.1200", 5).atomics).toEqual("412000");
      expect(Decimal.fromUserInput("4.12000", 5).atomics).toEqual("412000");
      expect(Decimal.fromUserInput("4.120000", 5).atomics).toEqual("412000");
      expect(Decimal.fromUserInput("4.1200000", 5).atomics).toEqual("412000");
    });

    it("interpretes the empty string as zero", () => {
      expect(Decimal.fromUserInput("", 0).atomics).toEqual("0");
      expect(Decimal.fromUserInput("", 1).atomics).toEqual("0");
      expect(Decimal.fromUserInput("", 2).atomics).toEqual("0");
      expect(Decimal.fromUserInput("", 3).atomics).toEqual("0");
    });
  });
});
