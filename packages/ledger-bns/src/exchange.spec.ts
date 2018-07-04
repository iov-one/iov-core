import { getPathForFirstLedgerNanoS } from "./exchange";

describe("Find Device", () => {
  it("can find ledger", () => {
    const ledger = getPathForFirstLedgerNanoS();
    expect(ledger).toBeTruthy();
    if (ledger) {
      expect(ledger.path).toBeTruthy();
      if (ledger.path) {
        expect(ledger.path.slice(0, 11)).toEqual("/dev/hidraw");
      }
      // tslint:disable-next-line:no-console
      console.log(ledger);
    }
  });
});
