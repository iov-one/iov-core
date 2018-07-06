import { Encoding, Slip0010RawIndex } from "@iov/crypto";
import { Algorithm, ChainId, SignableBytes } from "@iov/types";

import { KeyringEntrySerializationString } from "../keyring";
import { Ed25519HdKeyringEntry, Ed25519HdKeyringEntrySerialization } from "./ed25519hd";

describe("Ed25519HdKeyringEntry", () => {
  const emptyEntry = '{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [] }' as KeyringEntrySerializationString;

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

  it("can be created from mnemonic", () => {
    const entry = Ed25519HdKeyringEntry.fromMnemonic("execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard");
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
  });

  it("can create identities", done => {
    (async () => {
      const emptyEntries = [
        // all possible ways to construct an Ed25519HdKeyringEntry
        new Ed25519HdKeyringEntry(emptyEntry),
        Ed25519HdKeyringEntry.fromEntropy(Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad")),
        Ed25519HdKeyringEntry.fromMnemonic("execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard"),
      ];

      for (const entry of emptyEntries) {
        const newIdentity1 = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(0)]);
        const newIdentity2 = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(1)]);
        const newIdentity3 = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(1), Slip0010RawIndex.hardened(0)]);

        expect(newIdentity1.pubkey.data).not.toEqual(newIdentity2.pubkey.data);
        expect(newIdentity2.pubkey.data).not.toEqual(newIdentity3.pubkey.data);
        expect(newIdentity3.pubkey.data).not.toEqual(newIdentity1.pubkey.data);

        const identities = entry.getIdentities();
        expect(identities.length).toEqual(3);
        expect(identities[0].pubkey.algo).toEqual(Algorithm.ED25519);
        expect(identities[0].pubkey.data).toEqual(newIdentity1.pubkey.data);
        expect(identities[1].pubkey.algo).toEqual(Algorithm.ED25519);
        expect(identities[1].pubkey.data).toEqual(newIdentity2.pubkey.data);
        expect(identities[2].pubkey.algo).toEqual(Algorithm.ED25519);
        expect(identities[2].pubkey.data).toEqual(newIdentity3.pubkey.data);
      }

      done();
    })().catch(error => {
      setTimeout(() => {
        throw error;
      });
    });
  });

  it("can set, change and unset an identity label", done => {
    (async () => {
      const entry = new Ed25519HdKeyringEntry(emptyEntry);
      const newIdentity = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(0)]);
      expect(entry.getIdentities()[0].label).toBeUndefined();

      entry.setIdentityLabel(newIdentity, "foo");
      expect(entry.getIdentities()[0].label).toEqual("foo");

      entry.setIdentityLabel(newIdentity, "bar");
      expect(entry.getIdentities()[0].label).toEqual("bar");

      entry.setIdentityLabel(newIdentity, undefined);
      expect(entry.getIdentities()[0].label).toBeUndefined();

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
      const newIdentity = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(0)]);

      expect(entry.canSign.value).toEqual(true);

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
      const identity1 = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(0)]);
      const identity2 = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(1)]);
      const identity3 = await entry.createIdentityWithPath([Slip0010RawIndex.hardened(2), Slip0010RawIndex.hardened(0)]);
      entry.setIdentityLabel(identity1, undefined);
      entry.setIdentityLabel(identity2, "");
      entry.setIdentityLabel(identity3, "foo");

      const serialized = entry.serialize();
      expect(serialized).toBeTruthy();
      expect(serialized.length).toBeGreaterThan(100);

      const decodedJson: Ed25519HdKeyringEntrySerialization = JSON.parse(serialized);
      expect(decodedJson).toBeTruthy();
      expect(decodedJson.secret).toMatch(/^[a-z]+( [a-z]+)*$/);
      expect(decodedJson.identities.length).toEqual(3);
      expect(decodedJson.identities[0].localIdentity).toBeTruthy();
      expect(decodedJson.identities[0].localIdentity.pubkey.algo).toEqual("ed25519");
      expect(decodedJson.identities[0].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[0].localIdentity.label).toBeUndefined();
      expect(decodedJson.identities[0].privkeyPath).toEqual([0x80000000 + 0]);
      expect(decodedJson.identities[1].localIdentity).toBeTruthy();
      expect(decodedJson.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
      expect(decodedJson.identities[1].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[1].localIdentity.label).toEqual("");
      expect(decodedJson.identities[1].privkeyPath).toEqual([0x80000000 + 1]);
      expect(decodedJson.identities[2].localIdentity).toBeTruthy();
      expect(decodedJson.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
      expect(decodedJson.identities[2].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
      expect(decodedJson.identities[2].localIdentity.label).toEqual("foo");
      expect(decodedJson.identities[2].privkeyPath).toEqual([0x80000000 + 2, 0x80000000 + 0]);

      // keys are different
      expect(decodedJson.identities[0].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[1].localIdentity.pubkey.data);
      expect(decodedJson.identities[1].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[2].localIdentity.pubkey.data);
      expect(decodedJson.identities[2].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[0].localIdentity.pubkey.data);
      expect(decodedJson.identities[0].privkeyPath).not.toEqual(decodedJson.identities[1].privkeyPath);
      expect(decodedJson.identities[1].privkeyPath).not.toEqual(decodedJson.identities[2].privkeyPath);
      expect(decodedJson.identities[2].privkeyPath).not.toEqual(decodedJson.identities[0].privkeyPath);

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
      const entry = new Ed25519HdKeyringEntry('{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [] }' as KeyringEntrySerializationString);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkeyPath": [2147483649]}] }' as KeyringEntrySerializationString;
      const entry = new Ed25519HdKeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
    }

    {
      // two elements
      const serialized = '{ "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkeyPath": [2147483649]}, {"localIdentity": { "pubkey": { "algo": "ed25519", "data": "ddccbbaa" }, "label": "bar" }, "privkeyPath": [2147483650]}] }' as KeyringEntrySerializationString;
      const entry = new Ed25519HdKeyringEntry(serialized);
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
      const original = new Ed25519HdKeyringEntry(emptyEntry);
      const identity1 = await original.createIdentityWithPath([Slip0010RawIndex.hardened(0)]);
      const identity2 = await original.createIdentityWithPath([Slip0010RawIndex.hardened(1)]);
      const identity3 = await original.createIdentityWithPath([Slip0010RawIndex.hardened(2)]);
      original.setIdentityLabel(identity1, undefined);
      original.setIdentityLabel(identity2, "");
      original.setIdentityLabel(identity3, "foo");

      const restored = new Ed25519HdKeyringEntry(original.serialize());

      // pubkeys and labels match
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

  it("can be cloned", () => {
    const original = new Ed25519HdKeyringEntry(emptyEntry);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
  });
});
