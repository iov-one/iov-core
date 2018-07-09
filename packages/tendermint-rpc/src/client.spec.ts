import { Client } from "./client";
import { HttpClient } from "./rpcclient";
import * as versions from "./versions";

const skipTests = (): boolean => !process.env.TENDERMINT_ENABLED;

const pendingWithoutTendermint = (): boolean => {
  if (skipTests()) {
    pending("Set TENDERMINT_ENABLED to run tendermint rpc tests");
    return true;
  }
  return false;
};

describe("Verify client connects", () => {
  const tendermintUrl = "http://localhost:46657";

  it("Tries to connect with known version to tendermint", done => {
    pendingWithoutTendermint();

    const client = new Client(new HttpClient(tendermintUrl), versions.v0_20);
    client
      .abciInfo()
      .catch(err => fail(err))
      .then(done);
  });

  // it("Tries to auto-discover tendermint", () => {

  // });
});
