import { skipTests } from "./common.spec";
import { connectToFirstLedger, getFirstLedgerNanoS } from "./exchange";

describe("Find Device", () => {
  if (skipTests()) {
    return;
  }

  it("can find ledger", () => {
    const ledger = getFirstLedgerNanoS();
    expect(ledger).toBeTruthy();
    if (ledger) {
      expect(ledger.path).toBeTruthy();
    }
  });

  it("can connect to ledger", () => {
    const transport = connectToFirstLedger();
    expect(transport).toBeTruthy();
  });
});
