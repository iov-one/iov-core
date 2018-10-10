import { Encoding } from "@iov/encoding";

import { passphraseToKeypair, pubkeyToAddress } from "./derivation";

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
});
