import { Encoding } from "@iov/crypto";
import { Algorithm, ChainId, SignableBytes } from "@iov/types";

import { KeyDataString } from "../keyring";
import { Ed25519HdKeyringEntry } from "./ed25519hd";

describe("Ed25519HdKeyringEntry", () => {
  const emptyEntry = '{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [] }' as KeyDataString;

  it("can be deserialized", () => {
    const entry = new Ed25519HdKeyringEntry(emptyEntry);
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
  });

  it("can be created from entropy", () => {
    const entry = Ed25519HdKeyringEntry.fromEntropy(Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
  });

  it("can create identities", done => {
    (async () => {
      const entry = new Ed25519HdKeyringEntry(emptyEntry);

      const newIdentity1 = await entry.createIdentity();
      const newIdentity2 = await entry.createIdentity();
      const newIdentity3 = await entry.createIdentity();

      expect(newIdentity1.data).not.toEqual(newIdentity2.data);
      expect(newIdentity2.data).not.toEqual(newIdentity3.data);
      expect(newIdentity3.data).not.toEqual(newIdentity1.data);

      const identities = entry.getIdentities();
      expect(identities.length).toEqual(3);
      expect(identities[0].algo).toEqual(Algorithm.ED25519);
      expect(identities[0].data).toEqual(newIdentity1.data);
      expect(identities[1].algo).toEqual(Algorithm.ED25519);
      expect(identities[1].data).toEqual(newIdentity2.data);
      expect(identities[2].algo).toEqual(Algorithm.ED25519);
      expect(identities[2].data).toEqual(newIdentity3.data);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can set, change and unset an identity nickname", done => {
    (async () => {
      const entry = new Ed25519HdKeyringEntry(emptyEntry);
      const newIdentity = await entry.createIdentity();
      expect(entry.getIdentities()[0].nickname).toBeUndefined();

      entry.setIdentityNickname(newIdentity, "foo");
      expect(entry.getIdentities()[0].nickname).toEqual("foo");

      entry.setIdentityNickname(newIdentity, "bar");
      expect(entry.getIdentities()[0].nickname).toEqual("bar");

      entry.setIdentityNickname(newIdentity, undefined);
      expect(entry.getIdentities()[0].nickname).toBeUndefined();

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can sign", done => {
    (async () => {
      const entry = new Ed25519HdKeyringEntry(emptyEntry);
      const newIdentity = await entry.createIdentity();

      expect(entry.canSign).toEqual(true);

      const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
      const chainId = "some-chain" as ChainId;
      const signature = await entry.createTransactionSignature(newIdentity, tx, chainId);
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
      const entry = new Ed25519HdKeyringEntry(emptyEntry);
      const identity1 = await entry.createIdentity();
      const identity2 = await entry.createIdentity();
      const identity3 = await entry.createIdentity();
      entry.setIdentityNickname(identity1, undefined);
      entry.setIdentityNickname(identity2, "");
      entry.setIdentityNickname(identity3, "foo");

      const serialized = await entry.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized.length).toBeGreaterThan(100);

      const decodedJson = JSON.parse(serialized);
      expect(decodedJson).toBeTruthy();
      expect(decodedJson.secret).toMatch(/^[a-z]+( [a-z]+)*$/);
      expect(decodedJson.identities.length).toEqual(3);
      expect(decodedJson.identities[0].publicIdentity).toBeTruthy();
      expect(decodedJson.identities[0].publicIdentity.algo).toEqual("ed25519");
      expect(decodedJson.identities[0].publicIdentity.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[0].publicIdentity.nickname).toBeUndefined();
      expect(decodedJson.identities[0].privkey).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[1].publicIdentity).toBeTruthy();
      expect(decodedJson.identities[1].publicIdentity.algo).toEqual("ed25519");
      expect(decodedJson.identities[1].publicIdentity.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[1].publicIdentity.nickname).toEqual("");
      expect(decodedJson.identities[1].privkey).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[2].publicIdentity).toBeTruthy();
      expect(decodedJson.identities[2].publicIdentity.algo).toEqual("ed25519");
      expect(decodedJson.identities[2].publicIdentity.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[2].publicIdentity.nickname).toEqual("foo");
      expect(decodedJson.identities[2].privkey).toMatch(/[0-9a-f]{64}/);

      // keys are different
      expect(decodedJson.identities[0].publicIdentity.data).not.toEqual(decodedJson.identities[1].publicIdentity.data);
      expect(decodedJson.identities[1].publicIdentity.data).not.toEqual(decodedJson.identities[2].publicIdentity.data);
      expect(decodedJson.identities[2].publicIdentity.data).not.toEqual(decodedJson.identities[0].publicIdentity.data);
      expect(decodedJson.identities[0].privkey).not.toEqual(decodedJson.identities[1].privkey);
      expect(decodedJson.identities[1].privkey).not.toEqual(decodedJson.identities[2].privkey);
      expect(decodedJson.identities[2].privkey).not.toEqual(decodedJson.identities[0].privkey);

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
      const entry = new Ed25519HdKeyringEntry('{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [] }' as KeyDataString);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [{"publicIdentity": { "algo": "ed25519", "data": "aabbccdd", "nickname": "foo" }, "privkey": "223322112233aabb"}] }' as KeyDataString;
      const entry = new Ed25519HdKeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].nickname).toEqual("foo");
    }

    {
      // two elements
      const serialized = '{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [{"publicIdentity": { "algo": "ed25519", "data": "aabbccdd", "nickname": "foo" }, "privkey": "223322112233aabb"}, {"publicIdentity": { "algo": "ed25519", "data": "ddccbbaa", "nickname": "bar" }, "privkey": "ddddeeee"}] }' as KeyDataString;
      const entry = new Ed25519HdKeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(2);
      expect(entry.getIdentities()[0].algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].nickname).toEqual("foo");
      expect(entry.getIdentities()[1].algo).toEqual("ed25519");
      expect(entry.getIdentities()[1].data).toEqual(Encoding.fromHex("ddccbbaa"));
      expect(entry.getIdentities()[1].nickname).toEqual("bar");
    }
  });

  it("can serialize and restore a full keyring entry", done => {
    (async () => {
      const original = new Ed25519HdKeyringEntry(emptyEntry);
      const identity1 = await original.createIdentity();
      const identity2 = await original.createIdentity();
      const identity3 = await original.createIdentity();
      original.setIdentityNickname(identity1, undefined);
      original.setIdentityNickname(identity2, "");
      original.setIdentityNickname(identity3, "foo");

      const restored = new Ed25519HdKeyringEntry(await original.serialize());

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
