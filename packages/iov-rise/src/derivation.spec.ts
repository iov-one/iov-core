import { Encoding } from "@iov/encoding";

import { isValidAddress, passphraseToKeypair, pubkeyToAddress } from "./derivation";

const { fromHex } = Encoding;

describe("Derivation", () => {
  describe("passphraseToKeypair", () => {
    it("works with passphrase from RISE web wallet", async () => {
      const passphrase = "force vast web quiz trim tape hub tumble ship lemon member fault";

      const keypair = await passphraseToKeypair(passphrase);
      expect(keypair.pubkey).toEqual(
        // https://texplorer.rise.vision/address/8662508892470377605R
        fromHex("98afed9bff5bc076d3088c7ba69362e537aeb2847cc0e6452a242002c59cc3d1"),
      );
      expect(keypair.privkey).toEqual(jasmine.any(Uint8Array));
      expect(keypair.privkey.length).toEqual(32);
    });
  });

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
      expect(isValidAddress("1234567890R")).toBeTruthy();
      expect(isValidAddress("6076671634347365051R")).toBeTruthy();
      expect(isValidAddress("10176009299933723198R")).toBeTruthy();
      // 2**64-1
      expect(isValidAddress("18446744073709551615R")).toBeTruthy();
    });

    it("rejects malformed addresses", () => {
      // invalid ending
      expect(isValidAddress("1234567890L")).toBeFalsy();
      // leading 0
      expect(isValidAddress("01234567821R")).toBeFalsy();
      // decimal
      expect(isValidAddress("12345.6788R")).toBeFalsy();
      // string values
      expect(isValidAddress("12some45R")).toBeFalsy();
      // 2**64, 2**64 + 1
      expect(isValidAddress("18446744073709551616R")).toBeFalsy();
      expect(isValidAddress("18446744073709551617R")).toBeFalsy();
    });
  });
});
