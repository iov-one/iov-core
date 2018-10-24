import { EthereumConnection } from "./ethereumconnection";
import { TestConfig } from "./testconfig";

const skipTests = (): boolean => !process.env.ETHEREUM_ENABLED;

const pendingWithoutEthereum = () => {
  if (skipTests()) {
    pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
};

describe("EthereumConnection", () => {
  const base = TestConfig.base;
  const nodeChainId = TestConfig.chainId;
  const minHeight = TestConfig.minHeight;

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
});
