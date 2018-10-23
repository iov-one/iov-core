import { EthereumConnection } from "./ethereumconnection";
import { TestConfig } from "./testconfig";

describe("EthereumConnection", () => {
  const base = TestConfig.base;
  const nodeChainId = TestConfig.chainId;
  const minHeight = TestConfig.minHeight;

  it(`can be constructed for ${base}`, () => {
    const connection = new EthereumConnection(base, nodeChainId);
    expect(connection).toBeTruthy();
  });

  it("can get chain ID", async () => {
    const connection = await EthereumConnection.establish(base);
    const chainId = connection.chainId();
    expect(chainId).toEqual(nodeChainId);
  });

  it("can get height", async () => {
    const connection = await EthereumConnection.establish(base);
    const height = await connection.height();
    expect(height).toBeGreaterThan(minHeight);
  });
});
