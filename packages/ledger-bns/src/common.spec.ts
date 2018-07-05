import { isatty } from "tty";

// this should return true to skip ledger tests (to run on CI)
//
// current solution: skip if not attached to a tty (non-interactive)
// should look for a better solution, especially if we test in browser
export const skipTests = (): boolean => !isatty(0);
