import { connectToFirstLedger, getFirstLedgerNanoS, getPublicKey } from "./exchange";

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

  it("can read the public key", (done: any) => {
    const checkKey = async () => {
      const transport = connectToFirstLedger();
      const pubkey = await getPublicKey(transport);
      expect(pubkey).toBeTruthy();
      expect(pubkey.length).toBe(32);
    };
    checkKey()
      .catch(err => expect(err).toBeFalsy())
      .then(done);
  });
});
