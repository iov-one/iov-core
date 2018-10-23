import { EthereumConnection } from "./ethereumconnection";
import { TestConfig } from "./testconfig";

describe("EthereumConnection", () => {
  const base = TestConfig.base;
  const nodeChainId = TestConfig.chainId;
  console.log(`Running test in env ${TestConfig.env}`);

  it("can be constructed", () => {
    const connection = new EthereumConnection(base, nodeChainId);
    expect(connection).toBeTruthy();
  });

  it("can get chain ID", async () => {
    const connection = await EthereumConnection.establish(base);
    const chainId = connection.chainId();
    expect(chainId).toEqual(nodeChainId);
  });
});
