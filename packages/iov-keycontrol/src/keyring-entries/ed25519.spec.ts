import { PrehashType, SignableBytes } from "@iov/bcp-types";
import { Ed25519Keypair, Sha256, Sha512 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId } from "@iov/tendermint-types";

import { WalletSerializationString } from "../keyring";
import { Ed25519KeyringEntry } from "./ed25519";

const { fromHex, toHex } = Encoding;

describe("Ed25519KeyringEntry", () => {
  const defaultKeypair = new Ed25519Keypair(fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"), fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));

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
    const entry = new Ed25519KeyringEntry();
    const newIdentity = await entry.createIdentity(defaultKeypair);
    expect(newIdentity).toBeTruthy();
    expect(newIdentity.pubkey.algo).toEqual(Algorithm.Ed25519);
    expect(newIdentity.pubkey.data).toEqual(defaultKeypair.pubkey);
  });

  it("can create multiple identities", async () => {
    // keypairs from https://tools.ietf.org/html/draft-irtf-cfrg-eddsa-08#section-7.1
    const keypair1 = new Ed25519Keypair(fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"), fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
    const keypair2 = new Ed25519Keypair(fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb"), fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
    const keypair3 = new Ed25519Keypair(fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7"), fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));
    const keypair4 = new Ed25519Keypair(fromHex("f5e5767cf153319517630f226876b86c8160cc583bc013744c6bf255f5cc0ee5"), fromHex("278117fc144c72340f67d0f2316e8386ceffbf2b2428c9c51fef7c597f1d426e"));

    const keyringEntry = new Ed25519KeyringEntry();
    const newIdentity1 = await keyringEntry.createIdentity(keypair1);
    const newIdentity2 = await keyringEntry.createIdentity(keypair2);
    const newIdentity3 = await keyringEntry.createIdentity(keypair3);
    const newIdentity4 = await keyringEntry.createIdentity(keypair4);

    // all pubkeys must be different
    const pubkeySet = new Set([newIdentity1, newIdentity2, newIdentity3, newIdentity4].map(i => toHex(i.pubkey.data)));
    expect(pubkeySet.size).toEqual(4);

    // all localidentity.ids must be different
    const idSet = new Set([newIdentity1, newIdentity2, newIdentity3, newIdentity4].map(i => i.id));
    expect(idSet.size).toEqual(4);

    expect(keyringEntry.getIdentities().length).toEqual(4);

    const firstIdentity = keyringEntry.getIdentities()[0];
    expect(newIdentity1.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity1.pubkey.data).toEqual(firstIdentity.pubkey.data);
    expect(newIdentity1.label).toEqual(firstIdentity.label);

    const lastIdentity = keyringEntry.getIdentities()[3];
    expect(newIdentity4.pubkey.algo).toEqual(lastIdentity.pubkey.algo);
    expect(newIdentity4.pubkey.data).toEqual(lastIdentity.pubkey.data);
    expect(newIdentity4.label).toEqual(lastIdentity.label);
  });

  it("throws when adding the same keypair twice", async () => {
    // Same keypair leads to the same identity identifier, so we don't support it

    const entry = new Ed25519KeyringEntry();
    await entry.createIdentity(defaultKeypair);

    await entry
      .createIdentity(defaultKeypair)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/ID collision/i));
  });

  it("can set, change and unset an identity label", async () => {
    const keyringEntry = new Ed25519KeyringEntry();
    const newIdentity = await keyringEntry.createIdentity(defaultKeypair);
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
    expect(originalId).toMatch(/^[-_:a-zA-Z0-9]+$/);

    const id1 = await keyringEntry.createIdentity(defaultKeypair);
    expect(id1).toBeTruthy();
    expect(keyringEntry.id).toEqual(originalId); // id must not change with use

    // many more keyrings all with unique ids
    const manyIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(() => new Ed25519KeyringEntry().id);
    const uniqueVals = new Set(manyIds).size;
    expect(uniqueVals).toEqual(manyIds.length);
  });

  it("can sign", async () => {
    const keyringEntry = new Ed25519KeyringEntry();
    const newIdentity = await keyringEntry.createIdentity(defaultKeypair);

    expect(keyringEntry.canSign.value).toEqual(true);

    const tx = new Uint8Array([0x11, 0x22, 0x33]) as SignableBytes;
    const chainId = "some-chain" as ChainId;
    const signature = await keyringEntry.createTransactionSignature(newIdentity, tx, PrehashType.None, chainId);
    expect(signature).toBeTruthy();
    expect(signature.length).toEqual(64);
  });

  it("can sign with different prehash types", async () => {
    const entry = new Ed25519KeyringEntry();
    const mainIdentity = await entry.createIdentity(defaultKeypair);

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
    const mainIdentity = await entry.createIdentity(defaultKeypair);
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
    const keypair1 = new Ed25519Keypair(fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"), fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
    const keypair2 = new Ed25519Keypair(fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb"), fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
    const keypair3 = new Ed25519Keypair(fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7"), fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));

    const keyringEntry = new Ed25519KeyringEntry();
    keyringEntry.setLabel("entry with 3 identities");
    const identity1 = await keyringEntry.createIdentity(keypair1);
    const identity2 = await keyringEntry.createIdentity(keypair2);
    const identity3 = await keyringEntry.createIdentity(keypair3);
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
    expect(decoded.identities[0].privkey).toEqual("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60");
    expect(decoded.identities[1].localIdentity).toBeTruthy();
    expect(decoded.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[1].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[1].localIdentity.label).toEqual("");
    expect(decoded.identities[1].privkey).toEqual("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb");
    expect(decoded.identities[2].localIdentity).toBeTruthy();
    expect(decoded.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decoded.identities[2].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decoded.identities[2].localIdentity.label).toEqual("foo");
    expect(decoded.identities[2].privkey).toEqual("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7");
  });

  it("can deserialize", () => {
    {
      // empty
      const entry = new Ed25519KeyringEntry('{ "id": "ed25519:444555666", "identities": [] }' as WalletSerializationString);
      expect(entry).toBeTruthy();
      expect(entry.id).toEqual("ed25519:444555666");
      expect(entry.label.value).toBeUndefined();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '{ "id": "ed25519:12345678", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkey": "223322112233aabb"}] }' as WalletSerializationString;
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
      const serialized = '{ "id": "ed25519:87654321", "label": "2 keys", "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "privkey": "223322112233aabb"}, {"localIdentity": { "pubkey": { "algo": "ed25519", "data": "ddccbbaa" }, "label": "bar" }, "privkey": "ddddeeee"}] }' as WalletSerializationString;
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
    const keypair1 = new Ed25519Keypair(fromHex("9d61b19deffd5a60ba844af492ec2cc44449c5697b326919703bac031cae7f60"), fromHex("d75a980182b10ab7d54bfed3c964073a0ee172f3daa62325af021a68f707511a"));
    const keypair2 = new Ed25519Keypair(fromHex("4ccd089b28ff96da9db6c346ec114e0f5b8a319f35aba624da8cf6ed4fb8a6fb"), fromHex("3d4017c3e843895a92b70aa74d1b7ebc9c982ccf2ec4968cc0cd55f12af4660c"));
    const keypair3 = new Ed25519Keypair(fromHex("c5aa8df43f9f837bedb7442f31dcb7b166d38535076f094b85ce3a2e0b4458f7"), fromHex("fc51cd8e6218a1a38da47ed00230f0580816ed13ba3303ac5deb911548908025"));

    const original = new Ed25519KeyringEntry();
    const identity1 = await original.createIdentity(keypair1);
    const identity2 = await original.createIdentity(keypair2);
    const identity3 = await original.createIdentity(keypair3);
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
