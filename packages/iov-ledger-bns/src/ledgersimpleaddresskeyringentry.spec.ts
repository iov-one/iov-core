import Long from "long";

import { Nonce, PrehashType, RecipientId, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { bnsCodec } from "@iov/bns";
import { Ed25519, Sha512 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { KeyringEntrySerializationString } from "@iov/keycontrol";
import { Algorithm, ChainId } from "@iov/tendermint-types";

import { pendingWithoutInteractiveLedger, pendingWithoutLedger } from "./common.spec";
import { LedgerSimpleAddressKeyringEntry } from "./ledgersimpleaddresskeyringentry";

const { toHex } = Encoding;

describe("LedgerSimpleAddressKeyringEntry", () => {
  it("can be constructed", () => {
    const keyringEntry = new LedgerSimpleAddressKeyringEntry();
    expect(keyringEntry).toBeTruthy();
  });

  it("is empty after construction", () => {
    const keyringEntry = new LedgerSimpleAddressKeyringEntry();
    expect(keyringEntry.label.value).toBeUndefined();
    expect(keyringEntry.getIdentities().length).toEqual(0);
  });

  it("can have a label", () => {
    const entry = new LedgerSimpleAddressKeyringEntry();
    expect(entry.label.value).toBeUndefined();

    entry.setLabel("foo");
    expect(entry.label.value).toEqual("foo");

    entry.setLabel(undefined);
    expect(entry.label.value).toBeUndefined();
  });

  it("can create an identity", async () => {
    pendingWithoutLedger();

    const keyringEntry = new LedgerSimpleAddressKeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();
    expect(newIdentity).toBeTruthy();
    expect(newIdentity.pubkey.algo).toEqual(Algorithm.ED25519);
    expect(newIdentity.pubkey.data.length).toEqual(32);
  });

  it("can load a newly created identity", async () => {
    pendingWithoutLedger();

    const keyringEntry = new LedgerSimpleAddressKeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();

    expect(keyringEntry.getIdentities().length).toEqual(1);

    const firstIdentity = keyringEntry.getIdentities()[0];
    expect(newIdentity.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity.pubkey.data).toEqual(firstIdentity.pubkey.data);
    expect(newIdentity.label).toEqual(firstIdentity.label);
  });

  it("can create multiple identities", async () => {
    pendingWithoutLedger();

    const keyringEntry = new LedgerSimpleAddressKeyringEntry();
    const newIdentity1 = await keyringEntry.createIdentity();
    const newIdentity2 = await keyringEntry.createIdentity();
    const newIdentity3 = await keyringEntry.createIdentity();
    const newIdentity4 = await keyringEntry.createIdentity();
    const newIdentity5 = await keyringEntry.createIdentity();

    // all pubkeys must be different
    const pubkeySet = new Set([newIdentity1, newIdentity2, newIdentity3, newIdentity4, newIdentity5].map(i => toHex(i.pubkey.data)));
    expect(pubkeySet.size).toEqual(5);

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
    pendingWithoutLedger();

    const keyringEntry = new LedgerSimpleAddressKeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();
    expect(keyringEntry.getIdentities()[0].label).toBeUndefined();

    keyringEntry.setIdentityLabel(newIdentity, "foo");
    expect(keyringEntry.getIdentities()[0].label).toEqual("foo");

    keyringEntry.setIdentityLabel(newIdentity, "bar");
    expect(keyringEntry.getIdentities()[0].label).toEqual("bar");

    keyringEntry.setIdentityLabel(newIdentity, undefined);
    expect(keyringEntry.getIdentities()[0].label).toBeUndefined();
  });

  it("can sign", async () => {
    pendingWithoutInteractiveLedger();

    const keyringEntry = new LedgerSimpleAddressKeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();

    expect(keyringEntry.canSign.value).toEqual(true);

    const tx: SendTx = {
      kind: TransactionKind.Send,
      chainId: "test-ledger-paths" as ChainId,
      recipient: Encoding.fromHex("1234ABCD0000AA0000FFFF0000AA00001234ABCD") as RecipientId,
      amount: {
        // 77.01001 PATH
        whole: 77,
        fractional: 10010000,
        tokenTicker: "PATH" as TokenTicker,
      },
      signer: newIdentity.pubkey,
    };
    const nonce = Long.fromNumber(5) as Nonce;
    const message = bnsCodec.bytesToSign(tx, nonce).bytes;

    const signature = await keyringEntry.createTransactionSignature(newIdentity, message, PrehashType.Sha512, tx.chainId);
    expect(signature).toBeTruthy();
    expect(signature.length).toEqual(64);

    const prehash = new Sha512(message).digest();
    const ok = await Ed25519.verifySignature(signature, prehash, newIdentity.pubkey.data);
    expect(ok).toEqual(true);
  });

  it("can serialize multiple identities", async () => {
    pendingWithoutLedger();

    const entry = new LedgerSimpleAddressKeyringEntry();
    entry.setLabel("entry with 3 identities");
    const identity1 = await entry.createIdentity();
    const identity2 = await entry.createIdentity();
    const identity3 = await entry.createIdentity();
    entry.setIdentityLabel(identity1, undefined);
    entry.setIdentityLabel(identity2, "");
    entry.setIdentityLabel(identity3, "foo");

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
    expect(decodedJson.identities[0].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
    expect(decodedJson.identities[0].localIdentity.label).toBeUndefined();
    expect(decodedJson.identities[0].simpleAddressIndex).toEqual(0);
    expect(decodedJson.identities[1].localIdentity).toBeTruthy();
    expect(decodedJson.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[1].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
    expect(decodedJson.identities[1].localIdentity.label).toEqual("");
    expect(decodedJson.identities[1].simpleAddressIndex).toEqual(1);
    expect(decodedJson.identities[2].localIdentity).toBeTruthy();
    expect(decodedJson.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[2].localIdentity.pubkey.data).toMatch(/[0-9a-f]{64}/);
    expect(decodedJson.identities[2].localIdentity.label).toEqual("foo");
    expect(decodedJson.identities[2].simpleAddressIndex).toEqual(2);

    // keys are different
    expect(decodedJson.identities[0].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[1].localIdentity.pubkey.data);
    expect(decodedJson.identities[1].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[2].localIdentity.pubkey.data);
    expect(decodedJson.identities[2].localIdentity.pubkey.data).not.toEqual(decodedJson.identities[0].localIdentity.pubkey.data);
  });

  it("can deserialize", () => {
    {
      // empty
      const entry = new LedgerSimpleAddressKeyringEntry('{ "identities": [] }' as KeyringEntrySerializationString);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = '{ "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "simpleAddressIndex": 7}] }' as KeyringEntrySerializationString;
      const entry = new LedgerSimpleAddressKeyringEntry(serialized);
      expect(entry).toBeTruthy();
      expect(entry.getIdentities().length).toEqual(1);
      expect(entry.getIdentities()[0].pubkey.algo).toEqual("ed25519");
      expect(entry.getIdentities()[0].pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(entry.getIdentities()[0].label).toEqual("foo");
    }

    {
      // two elements
      const serialized = '{ "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "simpleAddressIndex": 7}, {"localIdentity": { "pubkey": { "algo": "ed25519", "data": "ddccbbaa" }, "label": "bar" }, "simpleAddressIndex": 23}] }' as KeyringEntrySerializationString;
      const entry = new LedgerSimpleAddressKeyringEntry(serialized);
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

  it("can serialize and restore a full keyring entry", async () => {
    pendingWithoutLedger();

    const original = new LedgerSimpleAddressKeyringEntry();
    const identity1 = await original.createIdentity();
    const identity2 = await original.createIdentity();
    const identity3 = await original.createIdentity();
    original.setIdentityLabel(identity1, undefined);
    original.setIdentityLabel(identity2, "");
    original.setIdentityLabel(identity3, "foo");

    const restored = new LedgerSimpleAddressKeyringEntry(original.serialize());

    // pubkeys and labels match
    expect(original.getIdentities()).toEqual(restored.getIdentities());

    // simpleAddressIndices are not exposed and cannot be compared
    // without interactively creating Ledger signatures.
  });

  it("can be cloned", () => {
    const oneIdentitySerialization = '{ "identities": [{"localIdentity": { "pubkey": { "algo": "ed25519", "data": "aabbccdd" }, "label": "foo" }, "simpleAddressIndex": 7}] }' as KeyringEntrySerializationString;
    const original = new LedgerSimpleAddressKeyringEntry(oneIdentitySerialization);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
  });

  describe("Keyring integration", () => {
    it("entry type can be registered", () => {
      LedgerSimpleAddressKeyringEntry.registerWithKeyring();
    });
  });
});
