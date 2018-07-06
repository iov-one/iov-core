import { pendingWithoutLedger } from "./common.spec";
import { connectToFirstLedger, getFirstLedgerNanoS } from "./exchange";

describe("Find Device", () => {
  it("can find ledger", () => {
    if (pendingWithoutLedger()) {
      return;
    }

    const ledger = getFirstLedgerNanoS();
    expect(ledger).toBeTruthy();
    if (ledger) {
      expect(ledger.path).toBeTruthy();
    }
  });

  it("can connect to ledger", () => {
    if (pendingWithoutLedger()) {
      return;
    }

    const transport = connectToFirstLedger();
    expect(transport).toBeTruthy();
  });
});
