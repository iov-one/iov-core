import { Address, BcpAccountQuery } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

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

  it("can get account", async () => {
    // Generate dead target address:
    // python3 -c 'import random; print("{}L".format(random.randint(0, 18446744073709551615)))'
    const client = new LiskClient(base);
    const query: BcpAccountQuery = { address: Encoding.toAscii("15683599531721344316L") as Address };
    const account = await client.getAccount(query);
    expect(account.data[0].address).toEqual(Encoding.toAscii("15683599531721344316L"));
    expect(account.data[0].balance[0].tokenTicker).toEqual("LSK");
    expect(account.data[0].balance[0].sigFigs).toEqual(8);
    expect(account.data[0].balance[0].whole).toEqual(15);
    expect(account.data[0].balance[0].fractional).toEqual(48687542);
  });
});
