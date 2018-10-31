import { TokenTicker } from "@iov/bcp-types";

import { BovFaucet } from "./bovfaucet";
import { randomBnsAddress } from "./utils";

describe("BovFaucet", () => {
  const faucetUrl = "https://faucet.friendnet-slow.iov.one/faucet";

  it("can be constructed", () => {
    const faucet = new BovFaucet(faucetUrl);
    expect(faucet).toBeTruthy();
  });

  it("can be used to credit a wallet", async () => {
    const faucet = new BovFaucet(faucetUrl);
    const address = await randomBnsAddress();
    await faucet.credit(address).catch(error => {
      if (error.response) {
        // append response body to error message
        throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    });
  });

  it("can be used to credit a wallet with a different token", async () => {
    const faucet = new BovFaucet(faucetUrl);
    const address = await randomBnsAddress();
    const ticker = "PAJA" as TokenTicker;
    await faucet.credit(address, ticker).catch(error => {
      if (error.response) {
        // append response body to error message
        throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    });
  });
});
