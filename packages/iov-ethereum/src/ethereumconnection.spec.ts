import { Address, BcpAccountQuery } from "@iov/bcp-types";
import { EthereumConnection } from "./ethereumconnection";
import { TestConfig } from "./testconfig";

function skipTests(): boolean {
  return !process.env.ETHEREUM_ENABLED;
}

function pendingWithoutEthereum(): void {
  if (skipTests()) {
    return pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
}

describe("EthereumConnection", () => {
  const base = TestConfig.base;
  const nodeChainId = TestConfig.chainId;
  const minHeight = TestConfig.minHeight;
  const address = TestConfig.address;
  const whole = TestConfig.whole;
  const fractional = TestConfig.fractional;
  const nonce = TestConfig.nonce;

  it(`can be constructed for ${base}`, () => {
    pendingWithoutEthereum();
    const connection = new EthereumConnection(base, nodeChainId);
    expect(connection).toBeTruthy();
  });

  it("can get chain ID", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const chainId = connection.chainId();
    expect(chainId).toEqual(nodeChainId);
  });

  it("can get height", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const height = await connection.height();
    expect(height).toBeGreaterThan(minHeight);
  });

  it("can get account from address", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const query: BcpAccountQuery = { address: address as Address };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual(address);
    expect(account.data[0].balance[0].tokenTicker).toEqual("ETH");
    expect(account.data[0].balance[0].sigFigs).toEqual(18);
    expect(account.data[0].balance[0].whole).toEqual(whole);
    expect(account.data[0].balance[0].fractional).toEqual(fractional);
  });

  it("can get nonce", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const query: BcpAccountQuery = { address: address as Address };
    const nonceResp = await connection.getNonce(query);

    expect(nonceResp.data[0].address).toEqual(address);
    expect(nonceResp.data[0].nonce).toEqual(nonce);
  });
});
