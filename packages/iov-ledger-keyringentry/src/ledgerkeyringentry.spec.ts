import { LedgerKeyringEntry } from "./ledgerkeyringentry";

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
});
