import { Encoding } from "@iov/encoding";
import { Algorithm } from "@iov/tendermint-types";

import { LedgerKeyringEntry } from "./ledgerkeyringentry";

const { toHex } = Encoding;

const skipTests = (): boolean => !process.env.LEDGER_ENABLED && !process.env.LEDGER_ALL;
const pendingWithoutLedger = (): void => {
  if (skipTests()) {
    pending("Set LEDGER_ENABLED to run ledger tests");
  }
};

describe("LedgerKeyringEntry", () => {
  it("can be constructed", () => {
    const keyringEntry = new LedgerKeyringEntry();
    expect(keyringEntry).toBeTruthy();
  });

  it("is empty after construction", () => {
    const keyringEntry = new LedgerKeyringEntry();
    expect(keyringEntry.label.value).toBeUndefined();
    expect(keyringEntry.getIdentities().length).toEqual(0);
  });

  it("can have a label", () => {
    const entry = new LedgerKeyringEntry();
    expect(entry.label.value).toBeUndefined();

    entry.setLabel("foo");
    expect(entry.label.value).toEqual("foo");

    entry.setLabel(undefined);
    expect(entry.label.value).toBeUndefined();
  });

  it("can create an identity", async () => {
    pendingWithoutLedger();

    const keyringEntry = new LedgerKeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();
    expect(newIdentity).toBeTruthy();
    expect(newIdentity.pubkey.algo).toEqual(Algorithm.ED25519);
    expect(newIdentity.pubkey.data.length).toEqual(32);
  });

  it("can load a newly created identity", async () => {
    pendingWithoutLedger();

    const keyringEntry = new LedgerKeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();

    expect(keyringEntry.getIdentities().length).toEqual(1);

    const firstIdentity = keyringEntry.getIdentities()[0];
    expect(newIdentity.pubkey.algo).toEqual(firstIdentity.pubkey.algo);
    expect(newIdentity.pubkey.data).toEqual(firstIdentity.pubkey.data);
    expect(newIdentity.label).toEqual(firstIdentity.label);
  });

  it("can create multiple identities", async () => {
    pendingWithoutLedger();

    const keyringEntry = new LedgerKeyringEntry();
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

    const keyringEntry = new LedgerKeyringEntry();
    const newIdentity = await keyringEntry.createIdentity();
    expect(keyringEntry.getIdentities()[0].label).toBeUndefined();

    keyringEntry.setIdentityLabel(newIdentity, "foo");
    expect(keyringEntry.getIdentities()[0].label).toEqual("foo");

    keyringEntry.setIdentityLabel(newIdentity, "bar");
    expect(keyringEntry.getIdentities()[0].label).toEqual("bar");

    keyringEntry.setIdentityLabel(newIdentity, undefined);
    expect(keyringEntry.getIdentities()[0].label).toBeUndefined();
  });
});
