import { getPublicKey } from "./app";
import { connectToFirstLedger } from "./exchange";

describe("Communicate with app", () => {
  const transport = connectToFirstLedger();

  it("can read the public key", (done: any) => {
    const checkKey = async () => {
      const pubkey = await getPublicKey(transport);
      expect(pubkey).toBeTruthy();
      expect(pubkey.length).toBe(32);
    };
    checkKey()
      .catch(err => fail(err))
      .then(done);
  });
});
