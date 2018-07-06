// this should return true to skip ledger tests (to run on CI)
//
// current solution: check for LEDGER_ENABLED=true environmental variable
// Does this work in browsers??
export const skipTests = (): boolean => !process.env.LEDGER_ENABLED;

export const pendingWithoutLedger = (): void => {
  if (skipTests()) {
    pending("Set LEDGER_ENABLED to run ledger tests");
  }
};
