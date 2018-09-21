import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Sha256, Sha512, Slip10Curve, Slip10RawIndex } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId } from "@iov/tendermint-types";

import { KeyringEntrySerializationString } from "../keyring";
import { Slip10KeyringEntry } from "./slip10";

const { fromHex } = Encoding;

// Set here for Browsers until this can be configured in Karma
// https://github.com/karma-runner/karma-jasmine/pull/211
// tslint:disable-next-line:no-object-mutation
jasmine.DEFAULT_TIMEOUT_INTERVAL = 30 * 1000;

describe("Slip10KeyringEntry", () => {
  const emptyEntry = `
    {
      "id": "aX-_oHf",
      "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive",
      "curve": "ed25519 seed",
      "identities": []
    }
    ` as KeyringEntrySerializationString;

  const emptySecp256k1Entry = `
    {
      "id": "2h3487-_h",
      "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive",
      "curve": "Bitcoin seed",
      "identities": []
    }
    ` as KeyringEntrySerializationString;

  it("can be deserialized", () => {
    const entry = new Slip10KeyringEntry(emptyEntry);
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
    expect(entry.id).toBeTruthy();
  });

  it("can be created from entropy", () => {
    const entry = Slip10KeyringEntry.fromEntropyWithCurve(Slip10Curve.Ed25519, Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad"));
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
    expect(entry.id).toBeTruthy();
  });

  it("can be created from mnemonic", () => {
    const entry = Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Ed25519, "execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard");
    expect(entry).toBeTruthy();
    expect(entry.getIdentities().length).toEqual(0);
    expect(entry.id).toBeTruthy();
  });

  it("can have a label", () => {
    const entry = Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Ed25519, "execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard");
    expect(entry.label.value).toBeUndefined();

    entry.setLabel("foo");
    expect(entry.label.value).toEqual("foo");

    entry.setLabel(undefined);
    expect(entry.label.value).toBeUndefined();
  });

  it("can create identities", async () => {
    const emptyEntries = [
      // all possible ways to construct a Slip10KeyringEntry
      new Slip10KeyringEntry(emptyEntry),
      Slip10KeyringEntry.fromEntropyWithCurve(Slip10Curve.Ed25519, Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad")),
      Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Ed25519, "execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard"),
    ];

    for (const entry of emptyEntries) {
      const newIdentity1 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(0)]);
      const newIdentity2 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(1)]);
      const newIdentity3 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(1), Slip10RawIndex.hardened(0)]);

      // all pubkeys must be different
      const pubkeySet = new Set([newIdentity1, newIdentity2, newIdentity3].map(i => Encoding.toHex(i.pubkey.data)));
      expect(pubkeySet.size).toEqual(3);
      // all localidentity.ids must be different
      const idSet = new Set([newIdentity1, newIdentity2, newIdentity3].map(i => i.id));
      expect(idSet.size).toEqual(3);

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
  });

  it("can create Secp256k1 identities", async () => {
    const emptyEntries = [
      // all possible ways to construct a Slip10KeyringEntry for Secp256k1
      new Slip10KeyringEntry(emptySecp256k1Entry),
      Slip10KeyringEntry.fromEntropyWithCurve(Slip10Curve.Secp256k1, Encoding.fromHex("51385c41df88cbe7c579e99de04259b1aa264d8e2416f1885228a4d069629fad")),
      Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Secp256k1, "execute wheel pupil bachelor crystal short domain faculty shrimp focus swap hazard"),
    ];

    for (const entry of emptyEntries) {
      const newIdentity1 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(0)]);
      const newIdentity2 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(1)]);
      const newIdentity3 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(1), Slip10RawIndex.hardened(0)]);

      // all pubkeys must be different
      const pubkeySet = new Set([newIdentity1, newIdentity2, newIdentity3].map(i => Encoding.toHex(i.pubkey.data)));
      expect(pubkeySet.size).toEqual(3);
      // all localidentity.ids must be different
      const idSet = new Set([newIdentity1, newIdentity2, newIdentity3].map(i => i.id));
      expect(idSet.size).toEqual(3);

      const identities = entry.getIdentities();
      expect(identities.length).toEqual(3);
      expect(identities[0].pubkey.algo).toEqual(Algorithm.SECP256K1);
      expect(identities[0].pubkey.data).toEqual(newIdentity1.pubkey.data);
      expect(identities[1].pubkey.algo).toEqual(Algorithm.SECP256K1);
      expect(identities[1].pubkey.data).toEqual(newIdentity2.pubkey.data);
      expect(identities[2].pubkey.algo).toEqual(Algorithm.SECP256K1);
      expect(identities[2].pubkey.data).toEqual(newIdentity3.pubkey.data);
    }
  });

  it("generates secp256k1 keys compatible to other tools", async () => {
    // Test data generated by the BIP44 tool of
    // https://iancoleman.io/bip39/#english

    const entry = Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Secp256k1, "mushroom faint dumb venture million true skull grab pitch mesh share tortoise");

    // m/44'/0'/7'/1/0
    const address0 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(0), Slip10RawIndex.hardened(7), Slip10RawIndex.normal(1), Slip10RawIndex.normal(0)]);
    expect(address0.pubkey.data).toEqual(fromHex("0388557bc34cf8229fc40cffe464344e946bf5c46257e820ea1632f3acbeaa723b"));

    // m/44'/0'/7'/1/1
    const address1 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(0), Slip10RawIndex.hardened(7), Slip10RawIndex.normal(1), Slip10RawIndex.normal(1)]);
    expect(address1.pubkey.data).toEqual(fromHex("03cf16066cbcb077cac488ad03995db1a6ad97c3f1088b59a9d5ae4ca449d7e4ad"));

    // m/44'/0'/7'/1/2
    const address2 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(0), Slip10RawIndex.hardened(7), Slip10RawIndex.normal(1), Slip10RawIndex.normal(2)]);
    expect(address2.pubkey.data).toEqual(fromHex("02f4a71480c4f6928ad10002ab17815ea4db2a56e545e5ef74d71d7b490171db93"));
  });

  it("generates ed25519 keys compatible to Stellar", async () => {
    // Test 1 from https://github.com/stellar/stellar-protocol/blob/master/ecosystem/sep-0005.md#test-cases
    //
    // Stellar public keys can be converted to raw ed25519 pubkeys as follows
    // $ yarn add stellar-sdk
    // $ node
    // > Keypair.fromPublicKey("GDRXE2BQUC3AZNPVFSCEZ76NJ3WWL25FYFK6RGZGIEKWE4SOOHSUJUJ6").rawPublicKey().toString("hex")
    const entry = Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Ed25519, "illness spike retreat truth genius clock brain pass fit cave bargain toe");

    // m/44'/148'/0'
    const address0 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(148), Slip10RawIndex.hardened(0)]);
    expect(address0.pubkey.data).toEqual(fromHex("e3726830a0b60cb5f52c844cffcd4eed65eba5c155e89b26411562724e71e544"));

    // m/44'/148'/1'
    const address1 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(148), Slip10RawIndex.hardened(1)]);
    expect(address1.pubkey.data).toEqual(fromHex("416edcd6746d5293579a7039ac67bcf1a8698efecf81183bbb0ac877da86ada3"));

    // m/44'/148'/2'
    const address2 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(44), Slip10RawIndex.hardened(148), Slip10RawIndex.hardened(2)]);
    expect(address2.pubkey.data).toEqual(fromHex("31d7c4074e8e8c07025e6f33a07e93ea45b9d83e96179f6b1f23465e96d8dd89"));
  });

  it("can set, change and unset an identity label", async () => {
    const entry = new Slip10KeyringEntry(emptyEntry);
    const newIdentity = await entry.createIdentityWithPath([Slip10RawIndex.hardened(0)]);
    const originalId = newIdentity.id;
    expect(entry.getIdentities()[0].label).toBeUndefined();

    entry.setIdentityLabel(newIdentity, "foo");
    expect(entry.getIdentities()[0].label).toEqual("foo");

    entry.setIdentityLabel(newIdentity, "bar");
    expect(entry.getIdentities()[0].label).toEqual("bar");

    entry.setIdentityLabel(newIdentity, undefined);
    expect(entry.getIdentities()[0].label).toBeUndefined();
    const finalId = entry.getIdentities()[0].id;
    expect(finalId).toEqual(originalId);
  });

  it("can sign", async () => {
    const entry = new Slip10KeyringEntry(emptyEntry);
    const newIdentity = await entry.createIdentityWithPath([Slip10RawIndex.hardened(0)]);

    expect(entry.canSign.value).toEqual(true);

    const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const chainId = "some-chain" as ChainId;
    const signature = await entry.createTransactionSignature(newIdentity, tx, PrehashType.None, chainId);
    expect(signature).toBeTruthy();
    expect(signature.length).toEqual(64);
  });

  it("can sign with different prehash types", async () => {
    const entry = new Slip10KeyringEntry(emptyEntry);
    const mainIdentity = await entry.createIdentityWithPath([Slip10RawIndex.hardened(0)]);

    const transactionBytes = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const chainId = "some-chain" as ChainId;

    const signaturePrehashNone = await entry.createTransactionSignature(mainIdentity, transactionBytes, PrehashType.None, chainId);
    const signaturePrehashSha256 = await entry.createTransactionSignature(mainIdentity, transactionBytes, PrehashType.Sha256, chainId);
    const signaturePrehashSha512 = await entry.createTransactionSignature(mainIdentity, transactionBytes, PrehashType.Sha512, chainId);
    expect(signaturePrehashNone.length).toEqual(64);
    expect(signaturePrehashSha256.length).toEqual(64);
    expect(signaturePrehashSha512.length).toEqual(64);

    expect(signaturePrehashNone).not.toEqual(signaturePrehashSha256);
    expect(signaturePrehashSha256).not.toEqual(signaturePrehashSha512);
    expect(signaturePrehashSha512).not.toEqual(signaturePrehashNone);
  });

  it("produces correct data for prehash signatures", async () => {
    const entry = new Slip10KeyringEntry(emptyEntry);
    const mainIdentity = await entry.createIdentityWithPath([Slip10RawIndex.hardened(0)]);
    const chainId = "some-chain" as ChainId;

    const bytes = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const bytesSha256 = new Sha256(bytes).digest();
    const bytesSha512 = new Sha512(bytes).digest();

    const expectedSha256 = await entry.createTransactionSignature(mainIdentity, bytesSha256 as SignableBytes, PrehashType.None, chainId);
    const expectedSha512 = await entry.createTransactionSignature(mainIdentity, bytesSha512 as SignableBytes, PrehashType.None, chainId);

    expect(await entry.createTransactionSignature(mainIdentity, bytes, PrehashType.Sha256, chainId)).toEqual(expectedSha256);
    expect(await entry.createTransactionSignature(mainIdentity, bytes, PrehashType.Sha512, chainId)).toEqual(expectedSha512);
  });

  it("can serialize multiple identities", async () => {
    const entry = new Slip10KeyringEntry(emptyEntry);
    entry.setLabel("entry with 3 identities");
    const originalId = entry.id;
    expect(originalId).toBeTruthy();
    const identity1 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(0)]);
    const identity2 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(1)]);
    const identity3 = await entry.createIdentityWithPath([Slip10RawIndex.hardened(2), Slip10RawIndex.hardened(0)]);
    entry.setIdentityLabel(identity1, undefined);
    entry.setIdentityLabel(identity2, "");
    entry.setIdentityLabel(identity3, "foo");
    expect(entry.id).toEqual(originalId);

    const serialized = entry.serialize();
    expect(serialized).toBeTruthy();
    expect(serialized.length).toBeGreaterThan(100);

    const decodedJson = JSON.parse(serialized);
    expect(decodedJson).toBeTruthy();
    expect(decodedJson.label).toEqual("entry with 3 identities");
    expect(decodedJson.secret).toMatch(/^[a-z]+( [a-z]+)*$/);
    expect(decodedJson.identities.length).toEqual(3);
    expect(decodedJson.identities[0].localIdentity).toBeTruthy();
    expect(decodedJson.identities[0].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[0].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decodedJson.identities[0].localIdentity.label).toBeUndefined();
    expect(decodedJson.identities[0].privkeyPath).toEqual([0x80000000 + 0]);
    expect(decodedJson.identities[1].localIdentity).toBeTruthy();
    expect(decodedJson.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[1].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decodedJson.identities[1].localIdentity.label).toEqual("");
    expect(decodedJson.identities[1].privkeyPath).toEqual([0x80000000 + 1]);
    expect(decodedJson.identities[2].localIdentity).toBeTruthy();
    expect(decodedJson.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[2].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decodedJson.identities[2].localIdentity.label).toEqual("foo");
    expect(decodedJson.identities[2].privkeyPath).toEqual([0x80000000 + 2, 0x80000000 + 0]);

    // keys are different
    expect(decodedJson.identities[0].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[1].localIdentity.pubkey.data);
    expect(decodedJson.identities[1].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[2].localIdentity.pubkey.data);
    expect(decodedJson.identities[2].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[0].localIdentity.pubkey.data);
    expect(decodedJson.identities[0].privkeyPath).not.toEqual(decodedJson.identities[1].privkeyPath);
    expect(decodedJson.identities[1].privkeyPath).not.toEqual(decodedJson.identities[2].privkeyPath);
    expect(decodedJson.identities[2].privkeyPath).not.toEqual(decodedJson.identities[0].privkeyPath);
  });

  it("can deserialize", () => {
    {
      // empty
      const entry = new Slip10KeyringEntry(`
        {
          "id": "eMpTy",
          "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive",
          "curve": "ed25519 seed",
          "identities": []
        }
        ` as KeyringEntrySerializationString);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(0);
      expect(entry.id).toEqual("eMpTy");
    }

    {
      // one element
      const serialized = `
        {
          "id": "1elemenT",
          "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive",
          "curve": "ed25519 seed",
          "identities": [
            {
              "localIdentity": {
                "pubkey": {
                  "algo": "ed25519",
                  "data": "aabbccdd"
                },
                "label": "foo"
              },
              "privkeyPath": [2147483649]
            }
          ]
        }
        ` as KeyringEntrySerializationString;
      const entry = new Slip10KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("1elemenT");
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
    }

    {
      // two elements
      const serialized = `
        {
          "id": "2elemeNT",
          "secret": "rhythm they leave position crowd cart pilot student razor indoor gesture thrive",
          "curve": "ed25519 seed",
          "identities": [
            {
              "localIdentity": {
                "pubkey": {
                  "algo": "ed25519",
                  "data": "aabbccdd"
                },
                "label": "foo"
              },
              "privkeyPath": [2147483649]
            },
            {
              "localIdentity": {
                "pubkey": {
                  "algo": "ed25519",
                  "data": "ddccbbaa"
                },
                "label": "bar"
              },
              "privkeyPath": [2147483650]
            }
          ]
        }` as KeyringEntrySerializationString;
      const entry = new Slip10KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("2elemeNT");
      expect(entry.getIdentities().length).toEqual(2);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
      expect(entry.getIdentities()[1].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[1].pubkey.data).toEqual(Encoding.fromHex("ddccbbaa"));
      expect(entry.getIdentities()[1].label).toEqual("bar");
    }
  });

  it("can serialize and restore a full keyring entry", async () => {
    const original = new Slip10KeyringEntry(emptyEntry);
    const identity1 = await original.createIdentityWithPath([Slip10RawIndex.hardened(0)]);
    const identity2 = await original.createIdentityWithPath([Slip10RawIndex.hardened(1)]);
    const identity3 = await original.createIdentityWithPath([Slip10RawIndex.hardened(2)]);
    original.setIdentityLabel(identity1, undefined);
    original.setIdentityLabel(identity2, "");
    original.setIdentityLabel(identity3, "foo");

    const restored = new Slip10KeyringEntry(original.serialize());
    expect(restored.id).toEqual(original.id);
    expect(restored.label.value).toEqual(original.label.value);

    // pubkeys and labels match
    expect(original.getIdentities()).toEqual(restored.getIdentities());

    // privkeys match
    const tx = new Uint8Array([]) as SignableBytes;
    const chainId = "" as ChainId;
    expect(await original.createTransactionSignature(identity1, tx, PrehashType.None, chainId)).toEqual(await restored.createTransactionSignature(identity1, tx, PrehashType.None, chainId));
    expect(await original.createTransactionSignature(identity2, tx, PrehashType.None, chainId)).toEqual(await restored.createTransactionSignature(identity2, tx, PrehashType.None, chainId));
    expect(await original.createTransactionSignature(identity3, tx, PrehashType.None, chainId)).toEqual(await restored.createTransactionSignature(identity3, tx, PrehashType.None, chainId));
  });

  it("can be cloned", () => {
    const original = new Slip10KeyringEntry(emptyEntry);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());

    // should have same characteristics
    expect(clone.id).toEqual(original.id);
    expect(clone.label.value).toEqual(original.label.value);
    expect(clone.getIdentities().length).toEqual(original.getIdentities().length);
  });

  it("generates different IDs for the same mnemonic", () => {
    const entry1 = Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Ed25519, "accident situate kitten crunch frog lobster horror hen wife gold extra athlete");
    const entry2 = Slip10KeyringEntry.fromMnemonicWithCurve(Slip10Curve.Ed25519, "accident situate kitten crunch frog lobster horror hen wife gold extra athlete");
    expect(entry1.id).not.toEqual(entry2.id);
  });
});
