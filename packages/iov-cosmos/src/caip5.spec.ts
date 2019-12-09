import { ChainId } from "@iov/bcp";

import { Caip5 } from "./caip5";

describe("Caip5", () => {
  describe("encode", () => {
    it("works for valid format", () => {
      expect(Caip5.encode("foo")).toEqual("cosmos:foo");
      expect(Caip5.encode("aA1-")).toEqual("cosmos:aA1-");
      expect(Caip5.encode("12345678901234567890123456789012345678901234567")).toEqual(
        "cosmos:12345678901234567890123456789012345678901234567",
      );
    });

    it("throws for invalid format", () => {
      // too short
      expect(() => Caip5.encode("")).toThrowError(/^Given chain ID cannot be CAPI-5 encoded/i);
      expect(() => Caip5.encode("1")).toThrowError(/^Given chain ID cannot be CAPI-5 encoded/i);
      expect(() => Caip5.encode("12")).toThrowError(/^Given chain ID cannot be CAPI-5 encoded/i);

      // too long
      expect(() => Caip5.encode("123456789012345678901234567890123456789012345678")).toThrowError(
        /^Given chain ID cannot be CAPI-5 encoded/i,
      );

      // invalid chars
      expect(() => Caip5.encode("foo bar")).toThrowError(/^Given chain ID cannot be CAPI-5 encoded/i);
      expect(() => Caip5.encode("wonderland🧝‍♂️")).toThrowError(/^Given chain ID cannot be CAPI-5 encoded/i);
    });
  });

  describe("decode", () => {
    it("works for valid format", () => {
      expect(Caip5.decode("cosmos:foo" as ChainId)).toEqual("foo");
      expect(Caip5.decode("cosmos:aA1-" as ChainId)).toEqual("aA1-");
      expect(Caip5.decode("cosmos:12345678901234567890123456789012345678901234567" as ChainId)).toEqual(
        "12345678901234567890123456789012345678901234567",
      );
    });

    it("throws for invalid format", () => {
      // wrong interface
      expect(() => Caip5.decode(":foobar" as ChainId)).toThrowError(/not compatible with CAIP-5/i);
      expect(() => Caip5.decode("cosmos-hash:foobar" as ChainId)).toThrowError(/not compatible with CAIP-5/i);

      // too short
      expect(() => Caip5.decode("cosmos:" as ChainId)).toThrowError(/not compatible with CAIP-5/i);
      expect(() => Caip5.decode("cosmos:1" as ChainId)).toThrowError(/not compatible with CAIP-5/i);
      expect(() => Caip5.decode("cosmos:12" as ChainId)).toThrowError(/not compatible with CAIP-5/i);

      // too long
      expect(() =>
        Caip5.decode("cosmos:123456789012345678901234567890123456789012345678" as ChainId),
      ).toThrowError(/not compatible with CAIP-5/i);

      // invalid chars
      expect(() => Caip5.decode("cosmos:foo bar" as ChainId)).toThrowError(/not compatible with CAIP-5/i);
      expect(() => Caip5.decode("cosmos:wonderland🧝‍♂️" as ChainId)).toThrowError(
        /not compatible with CAIP-5/i,
      );
    });
  });
});
