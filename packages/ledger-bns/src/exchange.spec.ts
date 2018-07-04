import { getPathForFirstLedgerNanoS } from "./exchange";

describe("Find Device", () => {
  it("can find ledger", () => {
    const ledgerPath = getPathForFirstLedgerNanoS();
    expect(ledgerPath).toBeTruthy();
    expect(ledgerPath).toEqual("/dev/hidraw5");
  });
});
