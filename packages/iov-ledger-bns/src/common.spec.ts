// Set the following environment variables to "1" to enable subsets of the Ledger tests
// LEDGER_ENABLED: basic tests
// LEDGER_SEEDED: tests that only pass when the Ledger is seeded with "tell fresh liquid vital machine rhythm uncle tomato grow room vacuum neutral"
// LEDGER_INTERACTIVE: tests that require you to press hardware buttons during the test run
// LEDGER_ALL: all of the above

export const skipTests = (): boolean => !process.env.LEDGER_ENABLED && !process.env.LEDGER_ALL;
export const pendingWithoutLedger = (): void => {
  if (skipTests()) {
    pending("Set LEDGER_ENABLED to run ledger tests");
  }
};

export const skipSeededTests = (): boolean => !process.env.LEDGER_SEEDED && !process.env.LEDGER_ALL;
export const pendingWithoutSeededLedger = (): void => {
  if (skipSeededTests()) {
    pending("Set LEDGER_SEEDED to enable derivation tests, ledger must be seeded with test key");
  }
};

export const skipInteractiveTests = (): boolean => !process.env.LEDGER_INTERACTIVE && !process.env.LEDGER_ALL;
export const pendingWithoutInteractiveLedger = (): void => {
  if (skipInteractiveTests()) {
    pending("Set LEDGER_INTERACTIVE to run ledger tests");
  }
};
