const { Ed25519 } = require('../src/crypto');

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
        done();
      })();
    });
  });
});
