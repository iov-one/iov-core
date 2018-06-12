import { Ed25519KeyringEntry } from "./keyring";

describe("Keyring", () => {
  describe("Ed25519KeyringEntry", () => {
    it("can be constructed", () => {
      const keyringEntry = new Ed25519KeyringEntry();
      expect(keyringEntry).toBeTruthy();
    });

    it("is empty after construction", done => {
      (async () => {
        const keyringEntry = new Ed25519KeyringEntry();
        expect((await keyringEntry.getIdentities()).length).toEqual(0);
        expect(await keyringEntry.serialize()).toEqual("[]");

        done();
      })();
    });
  });
});
