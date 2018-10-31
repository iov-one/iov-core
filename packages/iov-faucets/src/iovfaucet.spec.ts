import { TokenTicker } from "@iov/bcp-types";

import { IovFaucet } from "./iovfaucet";
import { randomBnsAddress } from "./utils";

function pendingWithoutBnsd(): void {
  if (!process.env.BOV_ENABLED) {
    pending("Set BOV_ENABLED to enable tests that need a bnsd blockchain");
  }
}

describe("IovFaucet", () => {
  const faucetUrl = "http://localhost:8000";
  const primaryToken = "CASH" as TokenTicker;
  const secondaryToken = "BASH" as TokenTicker;

  it("can be constructed", () => {
    // http
    expect(new IovFaucet("http://localhost:8000")).toBeTruthy();
    expect(new IovFaucet("http://localhost:8000/")).toBeTruthy();
    expect(new IovFaucet("http://localhost")).toBeTruthy();
    expect(new IovFaucet("http://localhost/")).toBeTruthy();
    // https
    expect(new IovFaucet("https://localhost:8000")).toBeTruthy();
    expect(new IovFaucet("https://localhost:8000/")).toBeTruthy();
    expect(new IovFaucet("https://localhost")).toBeTruthy();
    expect(new IovFaucet("https://localhost/")).toBeTruthy();
  });

  it("can be used to credit a wallet", async () => {
    pendingWithoutBnsd();
    const faucet = new IovFaucet(faucetUrl);
    const address = await randomBnsAddress();
    await faucet.credit(address, primaryToken).catch(error => {
      if (error.response) {
        // append response body to error message
        throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    });
  });

  it("can be used to credit a wallet with a different token", async () => {
    pendingWithoutBnsd();
    const faucet = new IovFaucet(faucetUrl);
    const address = await randomBnsAddress();
    await faucet.credit(address, secondaryToken).catch(error => {
      if (error.response) {
        // append response body to error message
        throw new Error(`${error}; response body: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    });
  });
});
