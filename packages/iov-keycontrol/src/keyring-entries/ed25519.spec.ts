import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Sha256, Sha512 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { ChainId } from "@iov/tendermint-types";

import { KeyringEntrySerializationString } from "../keyring";
import { Ed25519KeyringEntry } from "./ed25519";

const { toHex } = Encoding;

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

  it("can create an identity", async () => {
    const keyringEntry = new Ed25519KeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();
    expect(keyringEntry.getIdentities().length).toEqual(1);

    const firstIdentity = keyringEntry.getIdentities()[0];
    expect(newIdentity.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity.pubkey.data).toEqual(firstIdentity.pubkey.data);
    expect(newIdentity.label).toEqual(firstIdentity.label);
  });

  it("can create multiple identities", async () => {
    const keyringEntry = new Ed25519KeyringEntry();
    const newIdentity1 = await keyringEntry.createIdentity();
    const newIdentity2 = await keyringEntry.createIdentity();
    const newIdentity3 = await keyringEntry.createIdentity();
    const newIdentity4 = await keyringEntry.createIdentity();
    const newIdentity5 = await keyringEntry.createIdentity();

    // all pubkeys must be different
    const pubkeySet = new Set([newIdentity1, newIdentity2, newIdentity3, newIdentity4, newIdentity5].map(i => toHex(i.pubkey.data)));
    expect(pubkeySet.size).toEqual(5);

    // all localidentity.ids must be different
    const idSet = new Set([newIdentity1, newIdentity2, newIdentity3, newIdentity4, newIdentity5].map(i => i.id));
    expect(idSet.size).toEqual(5);

    expect(keyringEntry.getIdentities().length).toEqual(5);

    const firstIdentity = keyringEntry.getIdentities()[0];
    expect(newIdentity1.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity1.pubkey.data).toEqual(firstIdentity.pubkey.data);
    expect(newIdentity1.label).toEqual(firstIdentity.label);

    const lastIdentity = keyringEntry.getIdentities()[4];
    expect(newIdentity5.pubkey.algo).toEqual(lastIdentity.pubkey.algo);
    expect(newIdentity5.pubkey.data).toEqual(lastIdentity.pubkey.data);
    expect(newIdentity5.label).toEqual(lastIdentity.label);
  });

  it("can set, change and unset an identity label", async () => {
    const keyringEntry = new Ed25519KeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();
    expect(keyringEntry.getIdentities()[0].label).toBeUndefined();

    keyringEntry.setIdentityLabel(newIdentity, "foo");
    expect(keyringEntry.getIdentities()[0].label).toEqual("foo");

    keyringEntry.setIdentityLabel(newIdentity, "bar");
    expect(keyringEntry.getIdentities()[0].label).toEqual("bar");

    keyringEntry.setIdentityLabel(newIdentity, undefined);
    expect(keyringEntry.getIdentities()[0].label).toBeUndefined();
  });

  it("generates unique ids", async () => {
    const keyringEntry = new Ed25519KeyringEntry();
    const originalId = keyringEntry.id;
    expect(originalId).toBeTruthy();

    const id1 = await keyringEntry.createIdentity();
    expect(id1).toBeTruthy();
    expect(keyringEntry.id).toEqual(originalId); // id must not change with use

    // many more keyrings all with unique ids
    const manyIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => new Ed25519KeyringEntry().id);
    const uniqueVals = new Set(manyIds).size;
    expect(uniqueVals).toEqual(manyIds.length);
  });

  it("can sign", async () => {
    const keyringEntry = new Ed25519KeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();

    expect(keyringEntry.canSign.value).toEqual(true);

    const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const chainId = "some-chain" as ChainId;
    const signature = await keyringEntry.createTransactionSignature(newIdentity, tx, PrehashType.None, chainId);
    expect(signature).toBeTruthy();
    expect(signature.length).toEqual(64);
  });

  it("can sign with different prehash types", async () => {
    const entry = new Ed25519KeyringEntry();
    const mainIdentity = await entry.createIdentity();

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
    const entry = new Ed25519KeyringEntry();
    const mainIdentity = await entry.createIdentity();
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
    expect(decoded.identities[0].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[0].localIdentity.label).toBeUndefined();
    expect(decoded.identities[0].privkey).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[1].localIdentity).toBeTruthy();
    expect(decoded.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[1].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[1].localIdentity.label).toEqual("");
    expect(decoded.identities[1].privkey).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[2].localIdentity).toBeTruthy();
    expect(decoded.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[2].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[2].localIdentity.label).toEqual("foo");
    expect(decoded.identities[2].privkey).toMatch(/^[0-9a-f]{64}$/);

    // keys are different
    expect(decoded.identities[0].localIdentity.pubkey.data).not.toEqual(decoded.identities[1].localIdentity.pubkey.data);
    expect(decoded.identities[1].localIdentity.pubkey.data).not.toEqual(decoded.identities[2].localIdentity.pubkey.data);
    expect(decoded.identities[2].localIdentity.pubkey.data).not.toEqual(decoded.identities[0].localIdentity.pubkey.data);
    expect(decoded.identities[0].privkey).not.toEqual(decoded.identities[1].privkey);
    expect(decoded.identities[1].privkey).not.toEqual(decoded.identities[2].privkey);
    expect(decoded.identities[2].privkey).not.toEqual(decoded.identities[0].privkey);
  });

  it("can deserialize", () => {
    {
      // empty
      const entry = new Ed25519KeyringEntry('{ "id": "ed25519:444555666", "identities": [] }' as KeyringEntrySerializationString);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("ed25519:444555666");
      expect(entry.label.value).toBeUndefined();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '{ "id": "ed25519:12345678", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkey": "223322112233aabb"}] }' as KeyringEntrySerializationString;
      const entry = new Ed25519KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("ed25519:12345678");
      expect(entry.label.value).toBeUndefined();
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
    }

    {
      // two elements
      const serialized = '{ "id": "ed25519:87654321", "label": "2 keys", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkey": "223322112233aabb"}, {"localIdentity": { "pubkey": { "algo": "ed25519", "data": "ddccbbaa" }, "label": "bar" }, "privkey": "ddddeeee"}] }' as KeyringEntrySerializationString;
      const entry = new Ed25519KeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("ed25519:87654321");
      expect(entry.label.value).toEqual("2 keys");
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
    const original = new Ed25519KeyringEntry();
    const identity1 = await original.createIdentity();
    const identity2 = await original.createIdentity();
    const identity3 = await original.createIdentity();
    original.setIdentityLabel(identity1, undefined);
    original.setIdentityLabel(identity2, "");
    original.setIdentityLabel(identity3, "foo");
    original.setLabel("clone me");

    const restored = new Ed25519KeyringEntry(original.serialize());

    // label and id match
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
    const original = new Ed25519KeyringEntry();
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
  });
});
