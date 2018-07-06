import { pendingWithoutLedger } from "./common.spec";
import { connectToFirstLedger, getFirstLedgerNanoS } from "./exchange";

describe("Find Device", () => {
  it("can find ledger", () => {
    pendingWithoutLedger();

    const ledger = getFirstLedgerNanoS();
    expect(ledger).toBeTruthy();
    if (ledger) {
      expect(ledger.path).toBeTruthy();
    }
  });

  it("can connect to ledger", () => {
    pendingWithoutLedger();

    const transport = connectToFirstLedger();
    expect(transport).toBeTruthy();
  });
});
