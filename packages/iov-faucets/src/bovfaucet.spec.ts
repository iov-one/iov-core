import { Address, TokenTicker } from "@iov/bcp-types";
import { Random } from "@iov/crypto";

import { BovFaucet } from "./bovfaucet";

describe("BovFaucet", () => {
  const faucetUrl = "https://faucet.friendnet-slow.iov.one/faucet";

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

  it("can be opened for other token", async () => {
    const faucet = new BovFaucet(faucetUrl);
    const address = (await Random.getBytes(20)) as Address;
    const ticker = "PAJA" as TokenTicker;
    await faucet.open(address, ticker).catch(error => {
      // append response body to error message
      throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
    });
  });
});
