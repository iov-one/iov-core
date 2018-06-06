import { Ed25519 } from "../src/crypto";

describe("Crypto", () => {
  describe('Ed25519', () => {
    it('exists', () => {
      expect(Ed25519).toBeTruthy();
    });

    it("generates keypairs", (done) => {
      (async () => {
        let keypair = await Ed25519.generateKeypair();
        expect(keypair).toBeTruthy();
        expect(keypair.pubkey).toBeTruthy();
        expect(keypair.privkey).toBeTruthy();
        expect(keypair.pubkey.byteLength).toEqual(32);
        expect(keypair.privkey.byteLength).toEqual(64);

        done();
      })();
    });

    it("creates signatures", (done) => {
      (async () => {
        let keypair = await Ed25519.generateKeypair();
        let message = new Uint8Array([0x11, 0x22]);
        let signature = await Ed25519.createSignature(message, keypair.privkey);
        expect(signature).toBeTruthy();
        expect(signature.byteLength).toEqual(64);

        done();
      })();
    });
  });
});
