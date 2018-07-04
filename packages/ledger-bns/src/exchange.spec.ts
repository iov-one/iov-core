import { connectToFirstLedger, getFirstLedgerNanoS } from "./exchange";

describe("Find Device", () => {
  it("can find ledger", () => {
    const ledger = getFirstLedgerNanoS();
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

  it("can connect to ledger", () => {
    try {
      const transport = connectToFirstLedger();
      // tslint:disable:no-console
      console.log(transport);
    } catch (err) {
      fail(err);
    }
  });
});
