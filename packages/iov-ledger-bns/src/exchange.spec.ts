import { pendingWithoutLedger } from "./common.spec";
import { connectToFirstLedger, getFirstLedgerNanoS } from "./exchange";

describe("Exchange", () => {
  it("can find Ledger", () => {
    pendingWithoutLedger();

    const ledger = getFirstLedgerNanoS();
    expect(ledger).toBeTruthy();
    if (ledger) {
      expect(ledger.path).toBeTruthy();
    }
  });

  it("can connect to Ledger", () => {
    pendingWithoutLedger();

    const transport = connectToFirstLedger();
    expect(transport).toBeTruthy();
  });
});
