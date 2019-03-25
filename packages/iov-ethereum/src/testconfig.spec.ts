import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Nonce,
  PublicKeyBundle,
  PublicKeyBytes,
  TokenTicker,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { Erc20Options } from "./erc20";

const { fromHex } = Encoding;

export interface EthereumNetworkConfig {
  readonly env: string;
  readonly base: string;
  readonly wsUrl: string;
  readonly chainId: ChainId;
  readonly minHeight: number;
  /** one account with fixed state */
  readonly accountState: {
    readonly pubkey: PublicKeyBundle;
    readonly address: Address;
    /** expected balance for the `address` */
    readonly expectedBalance: Amount;
    /** expected nonce for the `address` */
    readonly expectedNonce: Nonce;
  };
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
  readonly expectedErrorMessages: {
    readonly insufficientFunds: RegExp;
    readonly invalidSignature: RegExp;
    readonly gasLimitTooLow: RegExp;
  };
  readonly erc20Tokens: Map<TokenTicker, Erc20Options>;
}

// Chain Id is from eip-155.md
// set process.env.ETH_ENV  'testnetRopsten', 'testnetRinkeby'
// default test env is local;
const env = process.env.ETH_ENV || "";

const local: EthereumNetworkConfig = {
  env: "local",
  base: "http://localhost:8545",
  wsUrl: "ws://localhost:8545/ws",
  chainId: "ethereum-eip155-5777" as ChainId,
  minHeight: 0, // ganache does not auto-generate a genesis block
  accountState: {
    pubkey: {
      algo: Algorithm.Secp256k1,
      data: fromHex(
        "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
      ) as PublicKeyBytes,
    },
    address: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
    expectedBalance: {
      quantity: "1234567890987654321",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    },
    expectedNonce: 0 as Nonce,
  },
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
  expectedErrorMessages: {
    insufficientFunds: /sender doesn't have enough funds to send tx/i,
    invalidSignature: /invalid signature/i,
    gasLimitTooLow: /base fee exceeds gas limit/i,
  },
  erc20Tokens: new Map([
    [
      "ASH" as TokenTicker,
      {
        contractAddress: "0xCb642A87923580b6F7D07D1471F93361196f2650" as Address,
      },
    ],
    [
      "TRASH" as TokenTicker,
      {
        contractAddress: "0x9768ae2339B48643d710B11dDbDb8A7eDBEa15BC" as Address,
        decimals: 9,
        symbol: "TRASH",
        name: "Trash Token",
      },
    ],
  ]),
};

/** Ropsten config is not well maintained and probably outdated. Use at your won risk. */
const testnetRopsten: EthereumNetworkConfig = {
  env: "ropsten",
  base: "https://ropsten.infura.io/",
  wsUrl: "wss://ropsten.infura.io/ws",
  chainId: "ethereum-eip155-3" as ChainId,
  minHeight: 4284887,
  accountState: {
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
    expectedNonce: 1 as Nonce,
  },
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
  expectedErrorMessages: {
    insufficientFunds: /insufficient funds for gas \* price \+ value/i,
    invalidSignature: /invalid sender/i,
    gasLimitTooLow: /intrinsic gas too low/i,
  },
  erc20Tokens: new Map([]),
};

const testnetRinkeby: EthereumNetworkConfig = {
  env: "rinkeby",
  base: "https://rinkeby.infura.io",
  wsUrl: "wss://rinkeby.infura.io/ws",
  chainId: "ethereum-eip155-4" as ChainId,
  minHeight: 3211058,
  accountState: {
    pubkey: {
      algo: Algorithm.Secp256k1,
      data: fromHex(
        "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
      ) as PublicKeyBytes,
    },
    address: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
    expectedBalance: {
      quantity: "7500016481703733500",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    },
    expectedNonce: 463 as Nonce,
  },
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
    // recipient address with no known keypair
    address: "0x7C14eF21979996A49551a16c7a96899e9C485eb4" as Address,
  },
  unusedPubkey: {
    algo: Algorithm.Secp256k1,
    data: fromHex(
      "049555be4c5136102e1645f9ce53475b2fed172078de78d3b7d0befed14f5471a077123dd459624055c93f85c0d8f99d9178b79b151f597f714ac759bca9dd3cb1",
    ) as PublicKeyBytes,
  },
  unusedAddress: "0x52dF0e01583E12978B0885C5836c9683f22b0618" as Address,
  expectedErrorMessages: {
    insufficientFunds: /insufficient funds for gas \* price \+ value/i,
    invalidSignature: /invalid sender/i,
    gasLimitTooLow: /intrinsic gas too low/i,
  },
  erc20Tokens: new Map([]),
};

const config = new Map<string, EthereumNetworkConfig>();
config.set("local", local);
config.set("testnetRopsten", testnetRopsten);
config.set("testnetRinkeby", testnetRinkeby);

export const testConfig = config.get(env) || local;
