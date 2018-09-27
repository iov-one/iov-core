import { LiskClient } from "./liskclient";

describe("LiskClient", () => {
  const base = "https://testnet.lisk.io";

  it("can be constructed", () => {
    const client = new LiskClient(base);
    expect(client).toBeTruthy();
  });

  it("can disconnect", () => {
    const client = new LiskClient(base);
    expect(() => client.disconnect()).not.toThrow();
  });

  it("can get chain ID", async () => {
    const client = new LiskClient(base);
    const chainId = await client.chainId();
    expect(chainId).toEqual("da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba");
  });

  it("can get height", async () => {
    const client = new LiskClient(base);
    const height = await client.height();
    expect(height).toBeGreaterThan(6000000);
    expect(height).toBeLessThan(8000000);
  });
});
