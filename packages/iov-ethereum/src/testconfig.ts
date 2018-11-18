import { ChainId } from "@iov/base-types";
import { Address, Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

export interface EthereumNetworkConfig {
  readonly env: string;
  readonly base: string;
  readonly chainId: ChainId;
  readonly minHeight: number;
  readonly address: Address;
  readonly whole: number;
  readonly fractional: number;
  readonly nonce: Nonce;
}

// Chain Id is from eip-155.md
// set process.env.ETH_ENV  'testnetRopsten', 'testnetRinkeby'
// default test env is local;
const env = process.env.ETH_ENV || "";

const local: EthereumNetworkConfig = {
  env: "local",
  base: "http://localhost:8545",
  chainId: "5777" as ChainId,
  minHeight: -1,
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  whole: 100,
  fractional: 0,
  nonce: new Int53(0) as Nonce,
};

const testnetRopsten: EthereumNetworkConfig = {
  env: "ropsten",
  base: "https://ropsten.infura.io/",
  chainId: "3" as ChainId,
  minHeight: 4284887,
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  whole: 100,
  fractional: 0,
  nonce: new Int53(0) as Nonce,
};

const testnetRinkeby: EthereumNetworkConfig = {
  env: "rinkeby",
  base: "https://rinkeby.infura.io",
  chainId: "4" as ChainId,
  minHeight: 3211058,
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  whole: 100,
  fractional: 0,
  nonce: new Int53(0) as Nonce,
};

const config = new Map<string, EthereumNetworkConfig>();
config.set("local", local);
config.set("testnetRopsten", testnetRopsten);
config.set("testnetRinkeby", testnetRinkeby);

export const TestConfig = config.get(env) || local;
