import { Address, TokenTicker } from "@iov/bcp-types";

import { IovFaucet } from "./iovfaucet";
import { randomBnsAddress } from "./utils";

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable tests that need a bnsd blockchain");
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
    await faucet.credit(address, primaryToken);
  });

  it("can be used to credit a wallet with a different token", async () => {
    pendingWithoutBnsd();
    const faucet = new IovFaucet(faucetUrl);
    const address = await randomBnsAddress();
    await faucet.credit(address, secondaryToken);
  });

  it("throws for invalid ticker", async () => {
    pendingWithoutBnsd();
    const faucet = new IovFaucet(faucetUrl);
    const address = await randomBnsAddress();
    await faucet
      .credit(address, "ETH" as TokenTicker)
      .then(() => fail("must not resolve"))
      .catch(error => expect(error).toMatch(/token is not available/i));
  });

  it("throws for invalid address", async () => {
    pendingWithoutBnsd();
    const faucet = new IovFaucet(faucetUrl);

    for (const address of ["be5cc2cc05db2cdb4313c18306a5157291cfdcd1" as Address, "1234L" as Address]) {
      await faucet
        .credit(address, primaryToken)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/address is not in the expected format for this chain/i));
    }
  });
});
