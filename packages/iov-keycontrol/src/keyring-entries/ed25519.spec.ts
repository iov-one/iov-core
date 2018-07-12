import { Encoding } from "@iov/crypto";
import { ChainId, Prehash, SignableBytes } from "@iov/types";

import { KeyringEntrySerializationString } from "../keyring";
import { Ed25519KeyringEntry } from "./ed25519";

describe("Ed25519KeyringEntry", () => {
  it("can be constructed", () => {
    const keyringEntry = new Ed25519KeyringEntry();
    expect(keyringEntry).toBeTruthy();
  });

  it("is empty after construction", () => {
    const keyringEntry = new Ed25519KeyringEntry();
    expect(keyringEntry.label.value).toBeUndefined();
    expect(keyringEntry.getIdentities().length).toEqual(0);
  });

  it("can have a label", () => {
    const entry = new Ed25519KeyringEntry();
    expect(entry.label.value).toBeUndefined();

    entry.setLabel("foo");
    expect(entry.label.value).toEqual("foo");

    entry.setLabel(undefined);
    expect(entry.label.value).toBeUndefined();
  });

  it("can create an identity", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      const newIdentity = await keyringEntry.createIdentity();
      expect(keyringEntry.getIdentities().length).toEqual(1);

      const firstIdentity = keyringEntry.getIdentities()[0];
      expect(newIdentity.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
      expect(newIdentity.pubkey.data).toEqual(firstIdentity.pubkey.data);
      expect(newIdentity.label).toEqual(firstIdentity.label);

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
      expect(newIdentity1.label).toEqual(firstIdentity.label);

      const lastIdentity = keyringEntry.getIdentities()[4];
      expect(newIdentity5.pubkey.algo).toEqual(lastIdentity.pubkey.algo);
      expect(newIdentity5.pubkey.data).toEqual(lastIdentity.pubkey.data);
      expect(newIdentity5.label).toEqual(lastIdentity.label);

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can set, change and unset an identity label", done => {
    (async () => {
      const keyringEntry = new Ed25519KeyringEntry();
      const newIdentity = await keyringEntry.createIdentity();
      expect(keyringEntry.getIdentities()[0].label).toBeUndefined();

      keyringEntry.setIdentityLabel(newIdentity, "foo");
      expect(keyringEntry.getIdentities()[0].label).toEqual("foo");

      keyringEntry.setIdentityLabel(newIdentity, "bar");
      expect(keyringEntry.getIdentities()[0].label).toEqual("bar");

      keyringEntry.setIdentityLabel(newIdentity, undefined);
      expect(keyringEntry.getIdentities()[0].label).toBeUndefined();

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

      expect(keyringEntry.canSign.value).toEqual(true);

      const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
      const chainId = "some-chain" as ChainId;
      const prehash = Prehash.PH_NONE;
      const signature = await keyringEntry.createTransactionSignature(newIdentity, tx, prehash, chainId);
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
      keyringEntry.setLabel("entry with 3 identities");
      const identity1 = await keyringEntry.createIdentity();
      const identity2 = await keyringEntry.createIdentity();
      const identity3 = await keyringEntry.createIdentity();
      keyringEntry.setIdentityLabel(identity1, undefined);
      keyringEntry.setIdentityLabel(identity2, "");
      keyringEntry.setIdentityLabel(identity3, "foo");

      const serialized = keyringEntry.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized.length).toBeGreaterThan(100);

      const decoded = JSON.parse(serialized);
      expect(decoded.label).toEqual("entry with 3 identities");
      expect(decoded.identities).toBeTruthy();
      expect(decoded.identities.length).toEqual(3);
      expect(decoded.identities[0].localIdentity).toBeTruthy();
      expect(decoded.identities[0].localIdentity.pubkey.algo).toEqual("ed25519");
      expect(decoded.identities[0].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decoded.identities[0].localIdentity.label).toBeUndefined();
      expect(decoded.identities[0].privkey).toMatch(/[0-9a-f]{64}/);
      expect(decoded.identities[1].localIdentity).toBeTruthy();
      expect(decoded.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
      expect(decoded.identities[1].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decoded.identities[1].localIdentity.label).toEqual("");
      expect(decoded.identities[1].privkey).toMatch(/[0-9a-f]{64}/);
      expect(decoded.identities[2].localIdentity).toBeTruthy();
      expect(decoded.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
      expect(decoded.identities[2].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decoded.identities[2].localIdentity.label).toEqual("foo");
      expect(decoded.identities[2].privkey).toMatch(/[0-9a-f]{64}/);

      // keys are different
      expect(decoded.identities[0].localIdentity.pubkey.data).not.toEqual(decoded.identities[1].localIdentity.pubkey.data);
      expect(decoded.identities[1].localIdentity.pubkey.data).not.toEqual(decoded.identities[2].localIdentity.pubkey.data);
      expect(decoded.identities[2].localIdentity.pubkey.data).not.toEqual(decoded.identities[0].localIdentity.pubkey.data);
      expect(decoded.identities[0].privkey).not.toEqual(decoded.identities[1].privkey);
      expect(decoded.identities[1].privkey).not.toEqual(decoded.identities[2].privkey);
      expect(decoded.identities[2].privkey).not.toEqual(decoded.identities[0].privkey);

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
      const entry = new Ed25519KeyringEntry('{ "identities": [] }' as KeyringEntrySerializationString);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '{ "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkey": "223322112233aabb"}] }' as KeyringEntrySerializationString;
      const entry = new Ed25519KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
    }

    {
      // two elements
      const serialized = '{ "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkey": "223322112233aabb"}, {"localIdentity": { "pubkey": { "algo": "ed25519", "data": "ddccbbaa" }, "label": "bar" }, "privkey": "ddddeeee"}] }' as KeyringEntrySerializationString;
      const entry = new Ed25519KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(2);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
      expect(entry.getIdentities()[1].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[1].pubkey.data).toEqual(Encoding.fromHex("ddccbbaa"));
      expect(entry.getIdentities()[1].label).toEqual("bar");
    }
  });

  it("can serialize and restore a full keyring entry", done => {
    (async () => {
      const original = new Ed25519KeyringEntry();
      const identity1 = await original.createIdentity();
      const identity2 = await original.createIdentity();
      const identity3 = await original.createIdentity();
      original.setIdentityLabel(identity1, undefined);
      original.setIdentityLabel(identity2, "");
      original.setIdentityLabel(identity3, "foo");

      const restored = new Ed25519KeyringEntry(original.serialize());

      // pubkeys and labels match
      expect(original.getIdentities()).toEqual(restored.getIdentities());

      // privkeys match
      const tx = new Uint8Array([]) as SignableBytes;
      const chainId = "" as ChainId;
      expect(await original.createTransactionSignature(identity1, tx, Prehash.PH_NONE, chainId)).toEqual(await restored.createTransactionSignature(identity1, tx, Prehash.PH_NONE, chainId));
      expect(await original.createTransactionSignature(identity2, tx, Prehash.PH_NONE, chainId)).toEqual(await restored.createTransactionSignature(identity2, tx, Prehash.PH_NONE, chainId));
      expect(await original.createTransactionSignature(identity3, tx, Prehash.PH_NONE, chainId)).toEqual(await restored.createTransactionSignature(identity3, tx, Prehash.PH_NONE, chainId));

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can be cloned", () => {
    const original = new Ed25519KeyringEntry();
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
  });
});
