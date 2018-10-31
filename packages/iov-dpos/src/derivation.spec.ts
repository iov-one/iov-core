import { Derivation } from "./derivation";

const { isValidAddressWithEnding } = Derivation;

describe("Derivation", () => {
  describe("isValidAddressWithEnding", () => {
    it("works for valid numbers within unsigned int64 range", () => {
      expect(isValidAddressWithEnding("1234567890L", "L")).toEqual(true);
      expect(isValidAddressWithEnding("6076671634347365051L", "L")).toEqual(true);
      expect(isValidAddressWithEnding("10176009299933723198L", "L")).toEqual(true);
      // 2**64-1
      expect(isValidAddressWithEnding("18446744073709551615L", "L")).toEqual(true);
    });

    it("rejects malformed addresses", () => {
      // invalid ending
      expect(isValidAddressWithEnding("1234567890R", "L")).toEqual(false);
      // leading 0
      expect(isValidAddressWithEnding("01234567821L", "L")).toEqual(false);
      // decimal
      expect(isValidAddressWithEnding("12345.6788L", "L")).toEqual(false);
      // string values
      expect(isValidAddressWithEnding("12some45L", "L")).toEqual(false);
      // 2**64, 2**64 + 1
      expect(isValidAddressWithEnding("18446744073709551616L", "L")).toEqual(false);
      expect(isValidAddressWithEnding("18446744073709551617L", "L")).toEqual(false);
    });
  });
});
