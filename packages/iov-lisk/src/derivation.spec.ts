import { Encoding } from "@iov/encoding";

import { passphraseToKeypair, pubkeyToAddress } from "./derivation";

const { fromHex, toAscii } = Encoding;

describe("Derivation", () => {
  describe("passphraseToKeypair", () => {
    it("works with passphrase from Lisk Hub", async () => {
      const passphrase = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";

      const keypair = await passphraseToKeypair(passphrase);
      expect(keypair.pubkey).toEqual(
        // 10176009299933723198L on Lisk Testnet
        fromHex("06ad4341a609af2de837e1156f81849b05bf3c280940a9f45db76d09a3a3f2fa"),
      );
      expect(keypair.privkey).toEqual(jasmine.any(Uint8Array));
      expect(keypair.privkey.length).toEqual(32);
    });
  });

  describe("pubkeyToAddress", () => {
    it("works for address in signed int64 range", () => {
      // https://testnet-explorer.lisk.io/address/6076671634347365051L
      const pubkey = fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184");
      expect(pubkeyToAddress(pubkey)).toEqual(toAscii("6076671634347365051L"));
    });
  });
});
