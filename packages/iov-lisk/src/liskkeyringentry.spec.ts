import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { KeyringEntrySerializationString } from "@iov/keycontrol";
import { Algorithm, ChainId } from "@iov/tendermint-types";

import { LiskKeyringEntry } from "./liskkeyringentry";

const { fromHex } = Encoding;

// use nethash as chain ID
const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;

describe("LiskKeyringEntry", () => {
  it("can be constructed", () => {
    const entry = new LiskKeyringEntry();
    expect(entry).toBeTruthy();
  });

  it("is empty after construction", () => {
    const entry = new LiskKeyringEntry();
    expect(entry.label.value).toBeUndefined();
    expect(entry.getIdentities().length).toEqual(0);
  });

  it("can have a label", () => {
    const entry = new LiskKeyringEntry();
    expect(entry.label.value).toBeUndefined();

    entry.setLabel("foo");
    expect(entry.label.value).toEqual("foo");

    entry.setLabel(undefined);
    expect(entry.label.value).toBeUndefined();
  });

  it("can create an identity", async () => {
    const entry = new LiskKeyringEntry();
    const newIdentity = await entry.createIdentity("my passphrase 1");
    expect(newIdentity).toBeTruthy();
    expect(newIdentity.pubkey.algo).toEqual(Algorithm.Ed25519);
    expect(newIdentity.pubkey.data.length).toEqual(32);
  });

  it("can create multiple identities", async () => {
    const entry = new LiskKeyringEntry();
    const identity1 = await entry.createIdentity("my passphrase 1");
    const identity2 = await entry.createIdentity("my passphrase 2");

    expect(identity1.pubkey.data).not.toEqual(identity2.pubkey.data);
    expect(entry.getIdentities().length).toEqual(2);
    expect(entry.getIdentities()[0].pubkey.data).toEqual(identity1.pubkey.data);
    expect(entry.getIdentities()[1].pubkey.data).toEqual(identity2.pubkey.data);
  });

  it("throws when adding the same passphrase twice", async () => {
    // Same passphrase leads to the same keypair and thus to the same
    // identity identifier.

    const entry = new LiskKeyringEntry();
    await entry.createIdentity("my passphrase");

    await entry
      .createIdentity("my passphrase")
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/ID collision/i));
  });

  it("can load a newly created identity", async () => {
    const entry = new LiskKeyringEntry();
    const newIdentity = await entry.createIdentity("my passphrase 1");

    expect(entry.getIdentities().length).toEqual(1);

    const firstIdentity = entry.getIdentities()[0];
    expect(firstIdentity.pubkey.algo).toEqual(newIdentity.pubkey.algo);
    expect(firstIdentity.pubkey.data).toEqual(newIdentity.pubkey.data);
    expect(firstIdentity.label).toEqual(newIdentity.label);
  });

  it("can set, change and unset an identity label", async () => {
    const entry = new LiskKeyringEntry();
    const newIdentity = await entry.createIdentity("my passphrase 1");
    expect(entry.getIdentities()[0].label).toBeUndefined();

    entry.setIdentityLabel(newIdentity, "foo");
    expect(entry.getIdentities()[0].label).toEqual("foo");

    entry.setIdentityLabel(newIdentity, "bar");
    expect(entry.getIdentities()[0].label).toEqual("bar");

    entry.setIdentityLabel(newIdentity, undefined);
    expect(entry.getIdentities()[0].label).toBeUndefined();
  });

  it("can sign", async () => {
    const entry = new LiskKeyringEntry();
    const newIdentity = await entry.createIdentity("my passphrase 1");

    expect(entry.canSign.value).toEqual(true);

    const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const signature = await entry.createTransactionSignature(
      newIdentity,
      tx,
      PrehashType.Sha256,
      liskTestnet,
    );
    expect(signature).toBeTruthy();
    expect(signature.length).toEqual(64);
  });

  it("throws for different prehash types", async () => {
    const entry = new LiskKeyringEntry();
    const mainIdentity = await entry.createIdentity("my passphrase 1");

    const transactionBytes = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;

    await entry
      .createTransactionSignature(mainIdentity, transactionBytes, PrehashType.None, liskTestnet)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/only prehash type sha256 is supported/i));
    await entry
      .createTransactionSignature(mainIdentity, transactionBytes, PrehashType.Sha512, liskTestnet)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/only prehash type sha256 is supported/i));
  });

  it("can serialize multiple identities", async () => {
    const entry = new LiskKeyringEntry();
    entry.setLabel("entry with 3 identities");
    const identity1 = await entry.createIdentity("my passphrase 1");
    const identity2 = await entry.createIdentity("my passphrase 2");
    const identity3 = await entry.createIdentity("my passphrase 3");
    entry.setIdentityLabel(identity1, undefined);
    entry.setIdentityLabel(identity2, "");
    entry.setIdentityLabel(identity3, "foo");

    const serialized = entry.serialize();
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
    expect(decoded.identities[0].passphrase).toEqual("my passphrase 1");
    expect(decoded.identities[1].localIdentity).toBeTruthy();
    expect(decoded.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[1].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[1].localIdentity.label).toEqual("");
    expect(decoded.identities[1].passphrase).toEqual("my passphrase 2");
    expect(decoded.identities[2].localIdentity).toBeTruthy();
    expect(decoded.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[2].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[2].localIdentity.label).toEqual("foo");
    expect(decoded.identities[2].passphrase).toEqual("my passphrase 3");

    // pubkeys are different
    expect(decoded.identities[0].localIdentity.pubkey.data).not.toEqual(
      decoded.identities[1].localIdentity.pubkey.data,
    );
    expect(decoded.identities[1].localIdentity.pubkey.data).not.toEqual(
      decoded.identities[2].localIdentity.pubkey.data,
    );
    expect(decoded.identities[2].localIdentity.pubkey.data).not.toEqual(
      decoded.identities[0].localIdentity.pubkey.data,
    );
  });

  it("can deserialize", () => {
    {
      // empty
      const entry = new LiskKeyringEntry(
        '{ "id": "aU8715ii", "identities": [] }' as KeyringEntrySerializationString,
      );
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("aU8715ii");
      expect(entry.label.value).toBeUndefined();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '{ "id": "3f4g1n6", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "passphrase": "super str0ng"}] }' as KeyringEntrySerializationString;
      const entry = new LiskKeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("3f4g1n6");
      expect(entry.label.value).toBeUndefined();
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
    }

    {
      // two elements
      const serialized = '{ "id": "3ojio497gt", "label": "2 keys", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "passphrase": "foo phrase"}, {"localIdentity": { "pubkey": { "algo": "ed25519", "data": "ddccbbaa" }, "label": "bar" }, "passphrase": "bar phrase"}] }' as KeyringEntrySerializationString;
      const entry = new LiskKeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("3ojio497gt");
      expect(entry.label.value).toEqual("2 keys");
      expect(entry.getIdentities().length).toEqual(2);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
      expect(entry.getIdentities()[1].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[1].pubkey.data).toEqual(fromHex("ddccbbaa"));
      expect(entry.getIdentities()[1].label).toEqual("bar");
    }
  });

  it("can serialize and restore a full keyring entry", async () => {
    const original = new LiskKeyringEntry();
    const identity1 = await original.createIdentity("a passphrase 1");
    const identity2 = await original.createIdentity("a passphrase 2");
    const identity3 = await original.createIdentity("a passphrase 3");
    original.setIdentityLabel(identity1, undefined);
    original.setIdentityLabel(identity2, "");
    original.setIdentityLabel(identity3, "foo");
    original.setLabel("clone me");

    const restored = new LiskKeyringEntry(original.serialize());

    // id and label match
    expect(restored.id).toEqual(original.id);
    expect(restored.label.value).toEqual(original.label.value);

    // pubkeys and labels match
    expect(original.getIdentities()).toEqual(restored.getIdentities());

    // privkeys match
    const tx = new Uint8Array([]) as SignableBytes;
    const chainId = "" as ChainId;
    expect(await original.createTransactionSignature(identity1, tx, PrehashType.Sha256, chainId)).toEqual(
      await restored.createTransactionSignature(identity1, tx, PrehashType.Sha256, chainId),
    );
    expect(await original.createTransactionSignature(identity2, tx, PrehashType.Sha256, chainId)).toEqual(
      await restored.createTransactionSignature(identity2, tx, PrehashType.Sha256, chainId),
    );
    expect(await original.createTransactionSignature(identity3, tx, PrehashType.Sha256, chainId)).toEqual(
      await restored.createTransactionSignature(identity3, tx, PrehashType.Sha256, chainId),
    );
  });

  it("can be cloned", () => {
    const original = new LiskKeyringEntry();
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
  });

  it("generates unique ids", () => {
    const ids = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => new LiskKeyringEntry().id);
    expect(new Set(ids).size).toEqual(10);
  });

  it("entry type can be registered with Keyring", () => {
    LiskKeyringEntry.registerWithKeyring();
  });
});
