import { ChainID, SignableBytes } from "@iov/types";
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

    it("can create an identity", done => {
      (async () => {
        const keyringEntry = new Ed25519KeyringEntry();
        const newIdentity = await keyringEntry.createIdentity();
        expect((await keyringEntry.getIdentities()).length).toEqual(1);

        const firstIdentity = (await keyringEntry.getIdentities())[0];
        expect(newIdentity.algo).toEqual(firstIdentity.algo);
        expect(newIdentity.data).toEqual(firstIdentity.data);
        expect(newIdentity.nickname).toEqual(firstIdentity.nickname);
        expect(newIdentity.canSign).toEqual(firstIdentity.canSign);

        done();
      })();
    });

    it("can create multiple identities", done => {
      (async () => {
        const keyringEntry = new Ed25519KeyringEntry();
        const newIdentity1 = await keyringEntry.createIdentity(); // 1
        await keyringEntry.createIdentity(); // 2
        await keyringEntry.createIdentity(); // 3
        await keyringEntry.createIdentity(); // 4
        const newIdentity5 = await keyringEntry.createIdentity(); // 5
        expect((await keyringEntry.getIdentities()).length).toEqual(5);

        const firstIdentity = (await keyringEntry.getIdentities())[0];
        expect(newIdentity1.algo).toEqual(firstIdentity.algo);
        expect(newIdentity1.data).toEqual(firstIdentity.data);
        expect(newIdentity1.nickname).toEqual(firstIdentity.nickname);
        expect(newIdentity1.canSign).toEqual(firstIdentity.canSign);

        const lastIdentity = (await keyringEntry.getIdentities())[4];
        expect(newIdentity5.algo).toEqual(lastIdentity.algo);
        expect(newIdentity5.data).toEqual(lastIdentity.data);
        expect(newIdentity5.nickname).toEqual(lastIdentity.nickname);
        expect(newIdentity5.canSign).toEqual(lastIdentity.canSign);

        done();
      })();
    });

    it("can set an identity nickname", done => {
      (async () => {
        const keyringEntry = new Ed25519KeyringEntry();
        const newIdentity = await keyringEntry.createIdentity();
        expect((await keyringEntry.getIdentities())[0].nickname).toBeUndefined();

        keyringEntry.setIdentityNickname(newIdentity, "foo");
        expect((await keyringEntry.getIdentities())[0].nickname).toEqual("foo");

        keyringEntry.setIdentityNickname(newIdentity, "bar");
        expect((await keyringEntry.getIdentities())[0].nickname).toEqual("bar");

        done();
      })();
    });

    it("can sign", done => {
      (async () => {
        const keyringEntry = new Ed25519KeyringEntry();
        const newIdentity = await keyringEntry.createIdentity();

        const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
        const chainId = "some-chain" as ChainID;
        const signature = await keyringEntry.createTransactionSignature(newIdentity, tx, chainId);
        expect(signature).toBeTruthy();
        expect(signature.length).toEqual(64);

        done();
      })();
    });

    it("can serialize multiple keys", done => {
      (async () => {
        const keyringEntry = new Ed25519KeyringEntry();
        await keyringEntry.createIdentity();
        await keyringEntry.createIdentity();
        await keyringEntry.createIdentity();

        const serialized = await keyringEntry.serialize();
        expect(serialized).toBeTruthy();
        expect(serialized.length).toBeGreaterThan(100);

        const decodedJson = JSON.parse(serialized);
        expect(decodedJson).toBeTruthy();
        expect(decodedJson.length).toEqual(3);
        expect(decodedJson[0].publicIdentity).toBeTruthy();
        expect(decodedJson[0].publicIdentity.algo).toEqual("ed25519");
        expect(decodedJson[0].publicIdentity.data).toMatch(/[0-9a-f]{64}/);
        expect(decodedJson[0].publicIdentity.nickname).toBeUndefined();
        expect(decodedJson[0].publicIdentity.canSign).toEqual(true);
        expect(decodedJson[0].privkey).toMatch(/[0-9a-f]{128}/);
        expect(decodedJson[1].publicIdentity).toBeTruthy();
        expect(decodedJson[1].publicIdentity.algo).toEqual("ed25519");
        expect(decodedJson[1].publicIdentity.data).toMatch(/[0-9a-f]{64}/);
        expect(decodedJson[1].publicIdentity.nickname).toBeUndefined();
        expect(decodedJson[1].publicIdentity.canSign).toEqual(true);
        expect(decodedJson[1].privkey).toMatch(/[0-9a-f]{128}/);
        expect(decodedJson[2].publicIdentity).toBeTruthy();
        expect(decodedJson[2].publicIdentity.algo).toEqual("ed25519");
        expect(decodedJson[2].publicIdentity.data).toMatch(/[0-9a-f]{64}/);
        expect(decodedJson[2].publicIdentity.nickname).toBeUndefined();
        expect(decodedJson[2].publicIdentity.canSign).toEqual(true);
        expect(decodedJson[2].privkey).toMatch(/[0-9a-f]{128}/);

        // keys are different
        expect(decodedJson[0].publicIdentity.data).not.toEqual(decodedJson[1].publicIdentity.data);
        expect(decodedJson[1].publicIdentity.data).not.toEqual(decodedJson[2].publicIdentity.data);
        expect(decodedJson[2].publicIdentity.data).not.toEqual(decodedJson[0].publicIdentity.data);
        expect(decodedJson[0].privkey).not.toEqual(decodedJson[1].privkey);
        expect(decodedJson[1].privkey).not.toEqual(decodedJson[2].privkey);
        expect(decodedJson[2].privkey).not.toEqual(decodedJson[0].privkey);

        done();
      })();
    });
  });
});
