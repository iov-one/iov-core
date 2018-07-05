// this should return true to skip ledger tests (to run on CI)
//
// current solution: check for TRAVIS=true environmental variable
// Does this work in browsers??
export const skipTests = (): boolean => !!process.env.TRAVIS;
