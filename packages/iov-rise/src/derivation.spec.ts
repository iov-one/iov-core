import { Encoding } from "@iov/encoding";

import { isValidAddress, pubkeyToAddress } from "./derivation";

const { fromHex } = Encoding;

describe("Derivation", () => {
  describe("pubkeyToAddress", () => {
    it("works for address in signed int64 range", () => {
      // https://texplorer.rise.vision/address/2064734259257657740R
      const pubkey = fromHex("b288e6f90327156c44d6c5599bf271e96c81ba085901396df08872bf397c3977");
      expect(pubkeyToAddress(pubkey)).toEqual("2064734259257657740R");
    });

    it("works for address outside of signed int64 range", () => {
      // https://texplorer.rise.vision/address/10145108642177909005R
      const pubkey = fromHex("34770ce843a01d975773ba2557b6643b32fe088818d343df2c32cbb89b286b3f");
      expect(pubkeyToAddress(pubkey)).toEqual("10145108642177909005R");
    });
  });

  describe("isValidAddress", () => {
    it("works for valid numbers within unsigned int64 range", () => {
      expect(isValidAddress("1234567890R")).toEqual(true);
      expect(isValidAddress("6076671634347365051R")).toEqual(true);
      expect(isValidAddress("10176009299933723198R")).toEqual(true);
      // 2**64-1
      expect(isValidAddress("18446744073709551615R")).toEqual(true);
    });

    it("rejects malformed addresses", () => {
      // invalid ending
      expect(isValidAddress("1234567890L")).toEqual(false);
      // leading 0
      expect(isValidAddress("01234567821R")).toEqual(false);
      // decimal
      expect(isValidAddress("12345.6788R")).toEqual(false);
      // string values
      expect(isValidAddress("12some45R")).toEqual(false);
      // 2**64, 2**64 + 1
      expect(isValidAddress("18446744073709551616R")).toEqual(false);
      expect(isValidAddress("18446744073709551617R")).toEqual(false);
    });
  });
});
