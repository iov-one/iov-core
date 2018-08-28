import { Address } from "@iov/bcp-types";
import { Random } from "@iov/crypto";

import { BovFaucet } from "./bovfaucet";

describe("BovFaucet", () => {
  const faucetUrl = "https://faucet.xerusnet.iov.one/faucet";

  it("can be constructed", () => {
    const faucet = new BovFaucet(faucetUrl);
    expect(faucet).toBeTruthy();
  });

  it("can be opened", async () => {
    const faucet = new BovFaucet(faucetUrl);
    const address = (await Random.getBytes(20)) as Address;
    await faucet.open(address).catch(error => {
      // append response body to error message
      throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
    });
  });
});
