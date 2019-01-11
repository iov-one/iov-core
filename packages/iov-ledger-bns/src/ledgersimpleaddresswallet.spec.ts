import {
  Address,
  Algorithm,
  ChainId,
  Nonce,
  PrehashType,
  SendTransaction,
  TokenTicker,
} from "@iov/bcp-types";
import { bnsCodec } from "@iov/bns";
import { Ed25519, Sha512 } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";
import { WalletId, WalletSerializationString } from "@iov/keycontrol";

import { pendingWithoutInteractiveLedger, pendingWithoutLedger } from "./common.spec";
import { LedgerSimpleAddressWallet } from "./ledgersimpleaddresswallet";
import { LedgerState } from "./statetracker";

const { toHex } = Encoding;

describe("LedgerSimpleAddressWallet", () => {
  const defaultChain = "chain123" as ChainId;

  it("can be constructed", () => {
    const wallet = new LedgerSimpleAddressWallet();
    expect(wallet).toBeTruthy();
    expect(wallet.id).toMatch(/^[a-zA-Z0-9]+$/);
  });

  it("is empty after construction", () => {
    const wallet = new LedgerSimpleAddressWallet();
    expect(wallet.label.value).toBeUndefined();
    expect(wallet.getIdentities().length).toEqual(0);
  });

  it("generates unique ID on creation", async () => {
    const walletIds: ReadonlyArray<WalletId> = [
      new LedgerSimpleAddressWallet(),
      new LedgerSimpleAddressWallet(),
      new LedgerSimpleAddressWallet(),
      new LedgerSimpleAddressWallet(),
      new LedgerSimpleAddressWallet(),
    ].map(wallet => wallet.id);
    const uniqueWalletIds = new Set(walletIds);
    expect(uniqueWalletIds.size).toEqual(5);
  });

  it("can have a label", () => {
    const wallet = new LedgerSimpleAddressWallet();
    expect(wallet.label.value).toBeUndefined();

    wallet.setLabel("foo");
    expect(wallet.label.value).toEqual("foo");

    wallet.setLabel(undefined);
    expect(wallet.label.value).toBeUndefined();
  });

  it("can create an identity", async () => {
    pendingWithoutLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    const newIdentity = await wallet.createIdentity(defaultChain, 0);
    expect(newIdentity).toBeTruthy();
    expect(newIdentity.pubkey.algo).toEqual(Algorithm.Ed25519);
    expect(newIdentity.pubkey.data.length).toEqual(32);
    wallet.stopDeviceTracking();
  });

  it("can load a newly created identity", async () => {
    pendingWithoutLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    const newIdentity = await wallet.createIdentity(defaultChain, 0);

    expect(wallet.getIdentities().length).toEqual(1);

    const firstIdentity = wallet.getIdentities()[0];
    expect(newIdentity.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity.pubkey.data).toEqual(firstIdentity.pubkey.data);
    wallet.stopDeviceTracking();
  });

  it("can create multiple identities", async () => {
    pendingWithoutLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    const newIdentity1 = await wallet.createIdentity(defaultChain, 0);
    const newIdentity2 = await wallet.createIdentity(defaultChain, 1);
    const newIdentity3 = await wallet.createIdentity(defaultChain, 2);
    const newIdentity4 = await wallet.createIdentity(defaultChain, 3);
    const newIdentity5 = await wallet.createIdentity(defaultChain, 4);

    // all pubkeys must be different
    const pubkeySet = new Set(
      [newIdentity1, newIdentity2, newIdentity3, newIdentity4, newIdentity5].map(i => toHex(i.pubkey.data)),
    );
    expect(pubkeySet.size).toEqual(5);

    expect(wallet.getIdentities().length).toEqual(5);

    const firstIdentity = wallet.getIdentities()[0];
    expect(newIdentity1.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity1.pubkey.data).toEqual(firstIdentity.pubkey.data);

    const lastIdentity = wallet.getIdentities()[4];
    expect(newIdentity5.pubkey.algo).toEqual(lastIdentity.pubkey.algo);
    expect(newIdentity5.pubkey.data).toEqual(lastIdentity.pubkey.data);
    wallet.stopDeviceTracking();
  });

  it("can create different identities with the same keypair", async () => {
    pendingWithoutLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    await wallet.createIdentity("chain1" as ChainId, 0);
    await wallet.createIdentity("chain2" as ChainId, 0);

    const identities = wallet.getIdentities();
    expect(identities.length).toEqual(2);
    expect(identities[0].chainId).toEqual("chain1");
    expect(identities[1].chainId).toEqual("chain2");
    expect(identities[0].pubkey).toEqual(identities[1].pubkey);
    wallet.stopDeviceTracking();
  });

  it("throws when adding the same identity index twice", async () => {
    pendingWithoutLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    await wallet.createIdentity(defaultChain, 0);
    await wallet
      .createIdentity(defaultChain, 0)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/Identity Index collision/i));
    wallet.stopDeviceTracking();
  });

  it("can set, change and unset an identity label", async () => {
    pendingWithoutLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    const newIdentity = await wallet.createIdentity(defaultChain, 0);
    expect(wallet.getIdentityLabel(newIdentity)).toBeUndefined();

    wallet.setIdentityLabel(newIdentity, "foo");
    expect(wallet.getIdentityLabel(newIdentity)).toEqual("foo");

    wallet.setIdentityLabel(newIdentity, "bar");
    expect(wallet.getIdentityLabel(newIdentity)).toEqual("bar");

    wallet.setIdentityLabel(newIdentity, undefined);
    expect(wallet.getIdentityLabel(newIdentity)).toBeUndefined();
    wallet.stopDeviceTracking();
  });

  it("has disconnected device state when created", () => {
    pendingWithoutInteractiveLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    expect(wallet.deviceState.value).toEqual(LedgerState.Disconnected);
    wallet.stopDeviceTracking();
  });

  it("changed device state to app open after some time", async () => {
    pendingWithoutInteractiveLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    expect(wallet.deviceState.value).toEqual(LedgerState.Disconnected);

    await wallet.deviceState.waitFor(LedgerState.IovAppOpen);
    expect(wallet.deviceState.value).toEqual(LedgerState.IovAppOpen);
    wallet.stopDeviceTracking();
  });

  it("cannot sign when created", () => {
    pendingWithoutInteractiveLedger();

    const wallet = new LedgerSimpleAddressWallet();
    expect(wallet.canSign.value).toEqual(false);
  });

  it("can sign after some time", async () => {
    pendingWithoutInteractiveLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    expect(wallet.canSign.value).toEqual(false);

    await wallet.canSign.waitFor(true);
    expect(wallet.canSign.value).toEqual(true);
    wallet.stopDeviceTracking();
  });

  it("cannot sign when device tracking is off", async () => {
    pendingWithoutInteractiveLedger();

    const wallet = new LedgerSimpleAddressWallet();
    expect(wallet.canSign.value).toEqual(false);

    wallet.startDeviceTracking();
    await wallet.canSign.waitFor(true);
    expect(wallet.canSign.value).toEqual(true);

    wallet.stopDeviceTracking();
    expect(wallet.canSign.value).toEqual(false);
  });

  it("can sign", async () => {
    pendingWithoutInteractiveLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    const newIdentity = await wallet.createIdentity(defaultChain, 0);

    await wallet.canSign.waitFor(true);

    const tx: SendTransaction = {
      kind: "bcp/send",
      creator: newIdentity,
      recipient: "tiov1zg62hngqqz4qqq8lluqqp2sqqqfrf27dzrrmea" as Address,
      amount: {
        // 77.01001 PATH
        quantity: "77010010000",
        fractionalDigits: 9,
        tokenTicker: "PATH" as TokenTicker,
      },
    };
    const nonce = new Int53(5) as Nonce;
    const { bytes, prehashType } = bnsCodec.bytesToSign(tx, nonce);

    const signature = await wallet.createTransactionSignature(newIdentity, bytes, prehashType);
    expect(signature).toBeTruthy();
    expect(signature.length).toEqual(64);

    switch (prehashType) {
      case PrehashType.Sha512:
        const prehash = new Sha512(bytes).digest();
        const valid = await Ed25519.verifySignature(signature, prehash, newIdentity.pubkey.data);
        expect(valid).toEqual(true);
        break;
      default:
        fail("Unexpected prehash type");
    }

    wallet.stopDeviceTracking();
  });

  it("throws when trying to export the secret", () => {
    const wallet = new LedgerSimpleAddressWallet();
    expect(() => wallet.printableSecret()).toThrowError(
      /extrating the secret from a hardware wallet is not possible/i,
    );
  });

  it("can serialize multiple identities", async () => {
    pendingWithoutLedger();

    const wallet = new LedgerSimpleAddressWallet();
    wallet.startDeviceTracking();
    wallet.setLabel("wallet with 3 identities");
    const identity1 = await wallet.createIdentity(defaultChain, 0);
    const identity2 = await wallet.createIdentity(defaultChain, 1);
    const identity3 = await wallet.createIdentity(defaultChain, 2);
    wallet.setIdentityLabel(identity1, undefined);
    wallet.setIdentityLabel(identity2, "");
    wallet.setIdentityLabel(identity3, "foo");

    const serialized = wallet.serialize();
    expect(serialized).toBeTruthy();
    expect(serialized.length).toBeGreaterThan(100);

    const decodedJson = JSON.parse(serialized);
    expect(decodedJson).toBeTruthy();
    expect(decodedJson.id).toMatch(/^[a-zA-Z0-9]+$/);
    expect(decodedJson.label).toEqual("wallet with 3 identities");
    expect(decodedJson.secret).toMatch(/^[a-z]+( [a-z]+)*$/);
    expect(decodedJson.identities.length).toEqual(3);
    expect(decodedJson.identities[0].localIdentity).toBeTruthy();
    expect(decodedJson.identities[0].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[0].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decodedJson.identities[0].localIdentity.label).toBeUndefined();
    expect(decodedJson.identities[0].simpleAddressIndex).toEqual(0);
    expect(decodedJson.identities[1].localIdentity).toBeTruthy();
    expect(decodedJson.identities[1].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[1].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decodedJson.identities[1].localIdentity.label).toEqual("");
    expect(decodedJson.identities[1].simpleAddressIndex).toEqual(1);
    expect(decodedJson.identities[2].localIdentity).toBeTruthy();
    expect(decodedJson.identities[2].localIdentity.pubkey.algo).toEqual("ed25519");
    expect(decodedJson.identities[2].localIdentity.pubkey.data).toMatch(/^[0-9a-f]{64}$/);
    expect(decodedJson.identities[2].localIdentity.label).toEqual("foo");
    expect(decodedJson.identities[2].simpleAddressIndex).toEqual(2);

    // keys are different
    expect(decodedJson.identities[0].localIdentity.pubkey.data).not.toEqual(
      decodedJson.identities[1].localIdentity.pubkey.data,
    );
    expect(decodedJson.identities[1].localIdentity.pubkey.data).not.toEqual(
      decodedJson.identities[2].localIdentity.pubkey.data,
    );
    expect(decodedJson.identities[2].localIdentity.pubkey.data).not.toEqual(
      decodedJson.identities[0].localIdentity.pubkey.data,
    );
    wallet.stopDeviceTracking();
  });

  it("can deserialize", () => {
    {
      // empty
      const serialized = `
        {
          "formatVersion": 2,
          "id": "7g97g98huhdd7",
          "identities": []
        }` as WalletSerializationString;
      const wallet = new LedgerSimpleAddressWallet(serialized);
      expect(wallet).toBeTruthy();
      expect(wallet.id).toEqual("7g97g98huhdd7");
      expect(wallet.getIdentities().length).toEqual(0);
    }

    {
      // one element
      const serialized = `
        {
          "formatVersion": 2,
          "id": "7g97g98huhdd7",
          "identities": [
            {
              "localIdentity": {
                "chainId": "bns123",
                "pubkey": { "algo": "ed25519", "data": "aabbccdd" },
                "label": "foo"
              },
              "simpleAddressIndex": 7
            }
          ]
        }` as WalletSerializationString;
      const wallet = new LedgerSimpleAddressWallet(serialized);
      expect(wallet).toBeTruthy();
      expect(wallet.id).toEqual("7g97g98huhdd7");
      expect(wallet.getIdentities().length).toEqual(1);
      const firstIdentity = wallet.getIdentities()[0];
      expect(firstIdentity.chainId).toEqual("bns123");
      expect(firstIdentity.pubkey.algo).toEqual("ed25519");
      expect(firstIdentity.pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(wallet.getIdentityLabel(firstIdentity)).toEqual("foo");
    }

    {
      // two elements
      const serialized = `
        {
          "formatVersion": 2,
          "id": "7g97g98huhdd7",
          "identities": [
            {
              "localIdentity": {
                "chainId": "bns123",
                "pubkey": { "algo": "ed25519", "data": "aabbccdd" },
                "label": "foo"
              },
              "simpleAddressIndex": 7
            },
            {
              "localIdentity": {
                "chainId": "bns123",
                "pubkey": { "algo": "ed25519", "data": "ddccbbaa" },
                "label": "bar"
              },
              "simpleAddressIndex": 23
            }
          ]
        }` as WalletSerializationString;
      const wallet = new LedgerSimpleAddressWallet(serialized);
      expect(wallet).toBeTruthy();
      expect(wallet.id).toEqual("7g97g98huhdd7");
      expect(wallet.getIdentities().length).toEqual(2);
      const firstIdentity = wallet.getIdentities()[0];
      const secondIdentity = wallet.getIdentities()[1];
      expect(firstIdentity.chainId).toEqual("bns123");
      expect(firstIdentity.pubkey.algo).toEqual("ed25519");
      expect(firstIdentity.pubkey.data).toEqual(Encoding.fromHex("aabbccdd"));
      expect(wallet.getIdentityLabel(firstIdentity)).toEqual("foo");
      expect(secondIdentity.chainId).toEqual("bns123");
      expect(secondIdentity.pubkey.algo).toEqual("ed25519");
      expect(secondIdentity.pubkey.data).toEqual(Encoding.fromHex("ddccbbaa"));
      expect(wallet.getIdentityLabel(secondIdentity)).toEqual("bar");
    }
  });

  it("throws for unsupported format version", () => {
    const data = '{ "formatVersion": 123, "id": "7g97g98huhdd7", "identities": [] }' as WalletSerializationString;
    expect(() => new LedgerSimpleAddressWallet(data)).toThrowError(/unsupported format version/i);
  });

  it("can serialize and restore a full wallet", async () => {
    pendingWithoutLedger();

    const original = new LedgerSimpleAddressWallet();
    original.startDeviceTracking();
    const identity1 = await original.createIdentity(defaultChain, 0);
    const identity2 = await original.createIdentity(defaultChain, 1);
    const identity3 = await original.createIdentity(defaultChain, 2);
    original.stopDeviceTracking();
    original.setIdentityLabel(identity1, undefined);
    original.setIdentityLabel(identity2, "");
    original.setIdentityLabel(identity3, "foo");

    const restored = new LedgerSimpleAddressWallet(original.serialize());

    // pubkeys and labels match
    expect(original.getIdentities()).toEqual(restored.getIdentities());

    // simpleAddressIndices are not exposed and cannot be compared
    // without interactively creating Ledger signatures.
  });

  it("can be cloned", () => {
    const oneIdentitySerialization = `
      {
        "formatVersion": 2,
        "id": "4h03vb03uhu",
        "identities": [
          {
            "localIdentity": {
              "chainId": "xnet",
              "pubkey": { "algo": "ed25519", "data": "aabbccdd" },
              "label": "foo"
            },
            "simpleAddressIndex": 7
          }
        ]
      }` as WalletSerializationString;
    const original = new LedgerSimpleAddressWallet(oneIdentitySerialization);
    const clone = original.clone();
    expect(clone).not.toBe(original);
    expect(clone.serialize()).toEqual(original.serialize());
  });

  describe("Keyring integration", () => {
    it("wallet type can be registered", () => {
      LedgerSimpleAddressWallet.registerWithKeyring();
    });
  });
});
