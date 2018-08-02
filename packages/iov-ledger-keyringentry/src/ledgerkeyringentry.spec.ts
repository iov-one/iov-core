import { Algorithm } from "@iov/tendermint-types";

import { LedgerKeyringEntry } from "./ledgerkeyringentry";

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
});
