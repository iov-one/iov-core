import { Encoding } from "@iov/encoding";

import { Derivation } from "./derivation";

const { fromHex } = Encoding;
const { isValidAddressWithEnding, passphraseToKeypair, pubkeyToAddress } = Derivation;

describe("Derivation", () => {
  describe("passphraseToKeypair", () => {
    it("works with passphrase from Lisk Hub", async () => {
      const passphrase = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";

      const keypair = await passphraseToKeypair(passphrase);
      expect(keypair.pubkey).toEqual(
        // 10176009299933723198L on Lisk Testnet
        Encoding.fromHex("06ad4341a609af2de837e1156f81849b05bf3c280940a9f45db76d09a3a3f2fa"),
      );
      expect(keypair.privkey).toEqual(jasmine.any(Uint8Array));
      expect(keypair.privkey.length).toEqual(32);
    });

    it("works with passphrase from RISE web wallet", async () => {
      const passphrase = "force vast web quiz trim tape hub tumble ship lemon member fault";

      const keypair = await passphraseToKeypair(passphrase);
      expect(keypair.pubkey).toEqual(
        // https://texplorer.rise.vision/address/8662508892470377605R
        Encoding.fromHex("98afed9bff5bc076d3088c7ba69362e537aeb2847cc0e6452a242002c59cc3d1"),
      );
      expect(keypair.privkey).toEqual(jasmine.any(Uint8Array));
      expect(keypair.privkey.length).toEqual(32);
    });
  });

  describe("pubkeyToAddress", () => {
    it("works for address in signed int64 range", () => {
      // https://testnet-explorer.lisk.io/address/6076671634347365051L
      const pubkey = fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184");
      expect(pubkeyToAddress(pubkey, "L")).toEqual("6076671634347365051L");
    });

    it("works for address outside of signed int64 range", () => {
      // https://testnet-explorer.lisk.io/address/10176009299933723198L
      const pubkey = fromHex("06ad4341a609af2de837e1156f81849b05bf3c280940a9f45db76d09a3a3f2fa");
      expect(pubkeyToAddress(pubkey, "L")).toEqual("10176009299933723198L");
    });

    it("works for RISE address", () => {
      // https://texplorer.rise.vision/address/2064734259257657740R
      const pubkey = fromHex("b288e6f90327156c44d6c5599bf271e96c81ba085901396df08872bf397c3977");
      expect(pubkeyToAddress(pubkey, "R")).toEqual("2064734259257657740R");
    });
  });

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
