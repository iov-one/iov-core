import { getPathForFirstLedgerNanoS } from "./exchange";

describe("Find Device", () => {
  it("can find ledger", () => {
    const ledgerPath = getPathForFirstLedgerNanoS();
    expect(ledgerPath).toBeTruthy();
    expect((ledgerPath as string).slice(0, 11)).toEqual("/dev/hidraw");
  });
});
