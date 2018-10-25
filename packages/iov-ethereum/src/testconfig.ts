import { ChainId } from "@iov/tendermint-types";

export interface EthereumNetworkConfig {
  readonly env: string;
  readonly base: string;
  readonly chainId: ChainId;
  readonly minHeight: number;
}

// Chain Id is from eip-155.md
// set process.env.ETH_ENV  'testnetRopsten', 'testnetRinkeby'
// default test env is local;
const env = process.env.ETH_ENV || "";

const local: EthereumNetworkConfig = {
  env: "local",
  base: "http://localhost:7545",
  chainId: "5777" as ChainId,
  minHeight: -1,
};

const testnetRopsten: EthereumNetworkConfig = {
  env: "ropsten",
  base: "https://ropsten.infura.io/",
  chainId: "3" as ChainId,
  minHeight: 4284887,
};

const testnetRinkeby: EthereumNetworkConfig = {
  env: "rinkeby",
  base: "https://rinkeby.infura.io",
  chainId: "4" as ChainId, // ISSUE: returns 0x30fdc1 (decimal number 3210689)
  minHeight: 3211058,
};

const config = new Map<string, EthereumNetworkConfig>();
config.set("local", local);
config.set("testnetRopsten", testnetRopsten);
config.set("testnetRinkeby", testnetRinkeby);

export const TestConfig = config.get(env) || local;
