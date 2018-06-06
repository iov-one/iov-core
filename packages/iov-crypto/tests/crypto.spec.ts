import { Ed25519, Sha256 } from "../src/crypto";

function toHex(data: Uint8Array): string {
  let out: string = "";
  for (let byte of data) {
    out += ('0' + byte.toString(16)).slice(-2);
  }
  return out;
}

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

    it("verifies signatures", (done) => {
      (async () => {
        let keypair = await Ed25519.generateKeypair();
        let message = new Uint8Array([0x11, 0x22]);
        let signature = await Ed25519.createSignature(message, keypair.privkey);

        { // valid
          let ok = await Ed25519.verifySignature(signature, message, keypair.pubkey);
          expect(ok).toEqual(true);
        }

        { // message corrupted
          message[0] ^= 0x01;
          let ok = await Ed25519.verifySignature(signature, message, keypair.pubkey);
          expect(ok).toEqual(false);
        }

        { // signature corrupted
          signature[0] ^= 0x01;
          let ok = await Ed25519.verifySignature(signature, message, keypair.pubkey);
          expect(ok).toEqual(false);
        }

        { // wrong pubkey
          let wrongPubkey = (await Ed25519.generateKeypair()).pubkey;
          let ok = await Ed25519.verifySignature(signature, message, wrongPubkey);
          expect(ok).toEqual(false);
        }

        done();
      })();
    });
  });

  describe('Sha256', () => {
    it('exists', () => {
      expect(Sha256).toBeTruthy();
    });

    it('works for empty input', (done) => {
      (async () => {
        let hash = await Sha256.digest(new Uint8Array([]));
        expect(toHex(hash)).toEqual("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");

        done();
      })();
    });
  });
});
