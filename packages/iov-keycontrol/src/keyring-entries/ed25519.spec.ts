import { Encoding } from "@iov/crypto";
import { ChainId, SignableBytes } from "@iov/types";

import { KeyDataString } from "../keyring";
import { Ed25519KeyringEntry } from "./ed25519";

describe("Ed25519KeyringEntry", () => {
  it("can be constructed", () => {
    const keyringEntry = new Ed25519KeyringEntry();
    expect(keyringEntry).toBeTruthy();
  });

  it("is empty after construction", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      expect(keyringEntry.getIdentities().length).toEqual(0);
      expect(await keyringEntry.serialize()).toEqual("[]");

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can create an identity", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      const newIdentity = await keyringEntry.createIdentity();
      expect(keyringEntry.getIdentities().length).toEqual(1);

      const firstIdentity = keyringEntry.getIdentities()[0];
      expect(newIdentity.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
      expect(newIdentity.pubkey.data).toEqual(firstIdentity.pubkey.data);
      expect(newIdentity.nickname).toEqual(firstIdentity.nickname);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can create multiple identities", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      const newIdentity1 = await keyringEntry.createIdentity(); // 1
      await keyringEntry.createIdentity(); // 2
      await keyringEntry.createIdentity(); // 3
      await keyringEntry.createIdentity(); // 4
      const newIdentity5 = await keyringEntry.createIdentity(); // 5
      expect(keyringEntry.getIdentities().length).toEqual(5);

      const firstIdentity = keyringEntry.getIdentities()[0];
      expect(newIdentity1.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
      expect(newIdentity1.pubkey.data).toEqual(firstIdentity.pubkey.data);
      expect(newIdentity1.nickname).toEqual(firstIdentity.nickname);

      const lastIdentity = keyringEntry.getIdentities()[4];
      expect(newIdentity5.pubkey.algo).toEqual(lastIdentity.pubkey.algo);
      expect(newIdentity5.pubkey.data).toEqual(lastIdentity.pubkey.data);
      expect(newIdentity5.nickname).toEqual(lastIdentity.nickname);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can set, change and unset an identity nickname", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      const newIdentity = await keyringEntry.createIdentity();
      expect(keyringEntry.getIdentities()[0].nickname).toBeUndefined();

      keyringEntry.setIdentityNickname(newIdentity, "foo");
      expect(keyringEntry.getIdentities()[0].nickname).toEqual("foo");

      keyringEntry.setIdentityNickname(newIdentity, "bar");
      expect(keyringEntry.getIdentities()[0].nickname).toEqual("bar");

      keyringEntry.setIdentityNickname(newIdentity, undefined);
      expect(keyringEntry.getIdentities()[0].nickname).toBeUndefined();

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can sign", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      const newIdentity = await keyringEntry.createIdentity();

      const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
      const chainId = "some-chain" as ChainId;
      const signature = await keyringEntry.createTransactionSignature(newIdentity, tx, chainId);
      expect(signature).toBeTruthy();
      expect(signature.length).toEqual(64);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can serialize multiple identities", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      const identity1 = await keyringEntry.createIdentity();
      const identity2 = await keyringEntry.createIdentity();
      const identity3 = await keyringEntry.createIdentity();
      keyringEntry.setIdentityNickname(identity1, undefined);
      keyringEntry.setIdentityNickname(identity2, "");
      keyringEntry.setIdentityNickname(identity3, "foo");

      const serialized = await keyringEntry.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized.length).toBeGreaterThan(100);

      const decodedJson = JSON.parse(serialized);
      expect(decodedJson).toBeTruthy();
      expect(decodedJson.length).toEqual(3);
      expect(decodedJson[0].publicIdentity).toBeTruthy();
      expect(decodedJson[0].publicIdentity.pubkey.algo).toEqual("ed25519");
      expect(decodedJson[0].publicIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson[0].publicIdentity.nickname).toBeUndefined();
      expect(decodedJson[0].privkey).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson[1].publicIdentity).toBeTruthy();
      expect(decodedJson[1].publicIdentity.pubkey.algo).toEqual("ed25519");
      expect(decodedJson[1].publicIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson[1].publicIdentity.nickname).toEqual("");
      expect(decodedJson[1].privkey).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson[2].publicIdentity).toBeTruthy();
      expect(decodedJson[2].publicIdentity.pubkey.algo).toEqual("ed25519");
      expect(decodedJson[2].publicIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson[2].publicIdentity.nickname).toEqual("foo");
      expect(decodedJson[2].privkey).toMatch(/[0-9a-f]{64}/);

      // keys are different
      expect(decodedJson[0].publicIdentity.pubkey.data).not.toEqual(decodedJson[1].publicIdentity.pubkey.data);
      expect(decodedJson[1].publicIdentity.pubkey.data).not.toEqual(decodedJson[2].publicIdentity.pubkey.data);
      expect(decodedJson[2].publicIdentity.pubkey.data).not.toEqual(decodedJson[0].publicIdentity.pubkey.data);
      expect(decodedJson[0].privkey).not.toEqual(decodedJson[1].privkey);
      expect(decodedJson[1].privkey).not.toEqual(decodedJson[2].privkey);
      expect(decodedJson[2].privkey).not.toEqual(decodedJson[0].privkey);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can deserialize", () => {
    {
      // empty
      const entry = new Ed25519KeyringEntry("[]" as KeyDataString);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '[{"publicIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "nickname": "foo" }, "privkey": "223322112233aabb"}]' as KeyDataString;
      const entry = new Ed25519KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].nickname).toEqual("foo");
    }

    {
      // two elements
      const serialized = '[{"publicIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "nickname": "foo" }, "privkey": "223322112233aabb"}, {"publicIdentity": { "pubkey": { "algo": "ed25519", "data": "ddccbbaa" }, "nickname": "bar" }, "privkey": "ddddeeee"}]' as KeyDataString;
      const entry = new Ed25519KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(2);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].nickname).toEqual("foo");
      expect(entry.getIdentities()[1].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[1].pubkey.data).toEqual(Encoding.fromHex("ddccbbaa"));
      expect(entry.getIdentities()[1].nickname).toEqual("bar");
    }
  });

  it("can serialize and restore a full keyring entry", done => {
    (async () => {
      const original = new Ed25519KeyringEntry();
      const identity1 = await original.createIdentity();
      const identity2 = await original.createIdentity();
      const identity3 = await original.createIdentity();
      original.setIdentityNickname(identity1, undefined);
      original.setIdentityNickname(identity2, "");
      original.setIdentityNickname(identity3, "foo");

      const restored = new Ed25519KeyringEntry(await original.serialize());

      // pubkeys and nicknames match
      expect(original.getIdentities()).toEqual(restored.getIdentities());

      // privkeys match
      const tx = new Uint8Array([]) as SignableBytes;
      const chainId = "" as ChainId;
      expect(await original.createTransactionSignature(identity1, tx, chainId)).toEqual(await restored.createTransactionSignature(identity1, tx, chainId));
      expect(await original.createTransactionSignature(identity2, tx, chainId)).toEqual(await restored.createTransactionSignature(identity2, tx, chainId));
      expect(await original.createTransactionSignature(identity3, tx, chainId)).toEqual(await restored.createTransactionSignature(identity3, tx, chainId));

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });
});
