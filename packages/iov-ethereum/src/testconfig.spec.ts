import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Nonce,
  PublicKeyBundle,
  PublicKeyBytes,
  TokenTicker,
} from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";

const { fromHex } = Encoding;

export interface EthereumNetworkConfig {
  readonly env: string;
  readonly base: string;
  readonly wsUrl: string;
  readonly chainId: ChainId;
  readonly minHeight: number;
  readonly pubkey: PublicKeyBundle;
  readonly address: Address;
  /** expected balance tor the `address` */
  readonly expectedBalance: Amount;
  readonly nonce: Nonce;
  readonly gasPrice: Amount;
  readonly gasLimit: Amount;
  readonly waitForTx: number;
  readonly scraper:
    | {
        readonly apiUrl: string;
        /** Account to query using the above API URL */
        readonly address: Address;
      }
    | undefined;
  /** An pubkey not used on this network */
  readonly unusedPubkey: PublicKeyBundle;
  /** The address that belongs to `unusedPubkey` */
  readonly unusedAddress: Address;
}

// Chain Id is from eip-155.md
// set process.env.ETH_ENV  'testnetRopsten', 'testnetRinkeby'
// default test env is local;
const env = process.env.ETH_ENV || "";

const local: EthereumNetworkConfig = {
  env: "local",
  base: "http://localhost:8545",
  wsUrl: "ws://localhost:8545",
  chainId: "ethereum-eip155-5777" as ChainId,
  minHeight: 0, // ganache does not auto-generate a genesis block
  pubkey: {
    algo: Algorithm.Secp256k1,
    data: fromHex(
      "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
    ) as PublicKeyBytes,
  },
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  expectedBalance: {
    quantity: "100000000000000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  nonce: new Int53(0) as Nonce,
  gasPrice: {
    quantity: "20000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  gasLimit: {
    quantity: "2100000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  waitForTx: 100, // by default, ganache will instantly mine a new block for every transaction
  scraper: undefined,
  unusedPubkey: {
    algo: Algorithm.Secp256k1,
    data: fromHex(
      "049555be4c5136102e1645f9ce53475b2fed172078de78d3b7d0befed14f5471a077123dd459624055c93f85c0d8f99d9178b79b151f597f714ac759bca9dd3cb1",
    ) as PublicKeyBytes,
  },
  unusedAddress: "0x52dF0e01583E12978B0885C5836c9683f22b0618" as Address,
};

const testnetRopsten: EthereumNetworkConfig = {
  env: "ropsten",
  base: "https://ropsten.infura.io/",
  wsUrl: "wss://ropsten.infura.io/ws",
  chainId: "ethereum-eip155-3" as ChainId,
  minHeight: 4284887,
  pubkey: {
    algo: Algorithm.Secp256k1,
    data: fromHex(
      "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
    ) as PublicKeyBytes,
  },
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  expectedBalance: {
    quantity: "2999979000000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  nonce: new Int53(1) as Nonce,
  gasPrice: {
    quantity: "1000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  gasLimit: {
    quantity: "141000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  waitForTx: 4000,
  scraper: {
    apiUrl: "https://api-ropsten.etherscan.io/api",
    address: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
  },
  unusedPubkey: {
    algo: Algorithm.Secp256k1,
    data: fromHex(
      "049555be4c5136102e1645f9ce53475b2fed172078de78d3b7d0befed14f5471a077123dd459624055c93f85c0d8f99d9178b79b151f597f714ac759bca9dd3cb1",
    ) as PublicKeyBytes,
  },
  unusedAddress: "0x52dF0e01583E12978B0885C5836c9683f22b0618" as Address,
};

const testnetRinkeby: EthereumNetworkConfig = {
  env: "rinkeby",
  base: "https://rinkeby.infura.io",
  wsUrl: "wss://rinkeby.infura.io/ws",
  chainId: "ethereum-eip155-4" as ChainId,
  minHeight: 3211058,
  pubkey: {
    algo: Algorithm.Secp256k1,
    data: fromHex(
      "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
    ) as PublicKeyBytes,
  },
  address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
  expectedBalance: {
    quantity: "20000000000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  nonce: new Int53(0) as Nonce,
  gasPrice: {
    quantity: "1000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  gasLimit: {
    quantity: "141000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  waitForTx: 4000,
  scraper: {
    apiUrl: "https://api-rinkeby.etherscan.io/api",
    address: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
  },
  unusedPubkey: {
    algo: Algorithm.Secp256k1,
    data: fromHex(
      "049555be4c5136102e1645f9ce53475b2fed172078de78d3b7d0befed14f5471a077123dd459624055c93f85c0d8f99d9178b79b151f597f714ac759bca9dd3cb1",
    ) as PublicKeyBytes,
  },
  unusedAddress: "0x52dF0e01583E12978B0885C5836c9683f22b0618" as Address,
};

const config = new Map<string, EthereumNetworkConfig>();
config.set("local", local);
config.set("testnetRopsten", testnetRopsten);
config.set("testnetRinkeby", testnetRinkeby);

export const testConfig = config.get(env) || local;
