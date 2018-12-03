import { ChainId, PublicKeyBytes } from "@iov/base-types";
import { Address, Nonce } from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";

const { fromHex } = Encoding;

export interface EthereumNetworkConfig {
  readonly env: string;
  readonly base: string;
  readonly chainId: ChainId;
  readonly minHeight: number;
  readonly pubkey: PublicKeyBytes;
  readonly address: Address;
  readonly quantity: string;
  readonly nonce: Nonce;
  readonly gasPrice: string;
  readonly gasLimit: string;
  readonly waitForTx: number;
  readonly scraperApi: string;
  readonly scraperChainId: ChainId;
  readonly scraperAddress: Address;
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
  pubkey: fromHex(
    "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
  ) as PublicKeyBytes,
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  quantity: "100000000000000000000",
  nonce: new Int53(0) as Nonce,
  gasPrice: "20000000000",
  gasLimit: "2100000",
  waitForTx: 100,
  scraperApi: "https://api-ropsten.etherscan.io/api",
  scraperChainId: "3" as ChainId,
  scraperAddress: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
};

const testnetRopsten: EthereumNetworkConfig = {
  env: "ropsten",
  base: "https://ropsten.infura.io/",
  chainId: "3" as ChainId,
  minHeight: 4284887,
  pubkey: fromHex(
    "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
  ) as PublicKeyBytes,
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  quantity: "2999979000000000000",
  nonce: new Int53(1) as Nonce,
  gasPrice: "1000000000",
  gasLimit: "141000",
  waitForTx: 4000,
  scraperApi: "https://api-ropsten.etherscan.io/api",
  scraperChainId: "3" as ChainId,
  scraperAddress: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
};

const testnetRinkeby: EthereumNetworkConfig = {
  env: "rinkeby",
  base: "https://rinkeby.infura.io",
  chainId: "4" as ChainId,
  minHeight: 3211058,
  pubkey: fromHex(
    "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
  ) as PublicKeyBytes,
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  quantity: "20000000000000000",
  nonce: new Int53(0) as Nonce,
  gasPrice: "1000000000",
  gasLimit: "141000",
  waitForTx: 4000,
  scraperApi: "https://api-rinkeby.etherscan.io/api",
  scraperChainId: "4" as ChainId,
  scraperAddress: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
};

const config = new Map<string, EthereumNetworkConfig>();
config.set("local", local);
config.set("testnetRopsten", testnetRopsten);
config.set("testnetRinkeby", testnetRinkeby);

export const TestConfig = config.get(env) || local;
