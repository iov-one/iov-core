import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Nonce,
  PubkeyBundle,
  PubkeyBytes,
  Token,
  TokenTicker,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { Erc20Options, Erc20TokensMap } from "./erc20";
import { EthereumConnectionOptions } from "./ethereumconnection";
import { SmartContractTokenType, SmartContractType } from "./smartcontracts/definitions";

const { fromHex } = Encoding;

export interface Erc20TransferTest {
  readonly amount: Amount;
}

export interface EthereumNetworkConfig {
  readonly env: string;
  readonly baseHttp: string;
  readonly baseWs: string;
  readonly connectionOptions: EthereumConnectionOptions;
  readonly chainId: ChainId;
  readonly minHeight: number;
  readonly mnemonic: string;
  readonly accountStates: {
    /** An account with ETH and ERC20 balance */
    readonly default: {
      readonly pubkey: PubkeyBundle;
      readonly address: Address;
      /** expected balance for the `address` */
      readonly expectedBalance: readonly Amount[];
      /** expected nonce for the `address` */
      readonly expectedNonce: Nonce;
    };
    /** An account with ERC20 balances but no ETH */
    readonly noEth: {
      readonly address: Address;
      /** expected balance for the `address` */
      readonly expectedBalance: readonly Amount[];
    };
    /** An account not used on this network */
    readonly unused: {
      readonly pubkey: PubkeyBundle;
      readonly address: Address;
    };
  };
  readonly gasPrice: Amount;
  readonly gasLimit: string;
  readonly expectedErrorMessages: {
    readonly insufficientFunds: RegExp;
    readonly invalidSignature: RegExp;
    readonly gasLimitTooLow: RegExp;
  };
  readonly erc20Tokens: Erc20TokensMap;
  readonly erc20TransferTests: readonly Erc20TransferTest[];
  readonly expectedTokens: readonly Token[];
}

// Set environment variable ETHEREUM_NETWORK to "local" (default), "ropsten", "rinkeby"
const env = process.env.ETHEREUM_NETWORK || "local";

const local: EthereumNetworkConfig = {
  env: "local",
  baseHttp: "http://localhost:8545",
  baseWs: "ws://localhost:8545/ws",
  connectionOptions: {
    // Low values to speedup test execution on the local ganache chain (using instant mine)
    pollInterval: 0.1,
    // Local scraper not used by default in CI to avoid circular dependency (@iov/ethereum <- scraper <- @iov/ethereum).
    // Comment out and set the ETHEREUM_SCRAPER environment variable for manual testing.
    // scraperApiUrl: "http://localhost:8546/api",
    scraperApiUrl: undefined,
    atomicSwapEtherContractAddress: "0xE1C9Ea25A621Cf5C934a7E112ECaB640eC7D8d18" as Address,
    atomicSwapErc20ContractAddress: "0x9768ae2339B48643d710B11dDbDb8A7eDBEa15BC" as Address,
    customSmartContractConfig: {
      type: SmartContractType.EscrowSmartContract,
      address: "0x11BfB4D394cF0dfADEEf269a6852E89C333449b2" as Address,
      fractionalDigits: 18,
      tokenType: SmartContractTokenType.ETHER,
      tokenTicker: "ETH" as TokenTicker,
    },
  },
  chainId: "ethereum-eip155-5777" as ChainId,
  minHeight: 0, // ganache does not auto-generate a genesis block
  mnemonic: "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
  accountStates: {
    default: {
      pubkey: {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
        ) as PubkeyBytes,
      },
      address: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
      expectedBalance: [
        {
          tokenTicker: "ASH" as TokenTicker,
          quantity: "33445566",
          fractionalDigits: 12,
        },
        {
          tokenTicker: "ETH" as TokenTicker,
          quantity: "1234567890987654321",
          fractionalDigits: 18,
        },
        {
          tokenTicker: "TRASH" as TokenTicker,
          quantity: "33445566",
          fractionalDigits: 9,
        },
      ],
      expectedNonce: 0 as Nonce,
    },
    noEth: {
      address: "0x0000000000111111111122222222223333333333" as Address,
      expectedBalance: [
        {
          tokenTicker: "ASH" as TokenTicker,
          quantity: "38",
          fractionalDigits: 12,
        },
        // ETH balance should be listed anyway
        {
          tokenTicker: "ETH" as TokenTicker,
          quantity: "0",
          fractionalDigits: 18,
        },
        {
          tokenTicker: "TRASH" as TokenTicker,
          quantity: "38",
          fractionalDigits: 9,
        },
      ],
    },
    unused: {
      pubkey: {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "049555be4c5136102e1645f9ce53475b2fed172078de78d3b7d0befed14f5471a077123dd459624055c93f85c0d8f99d9178b79b151f597f714ac759bca9dd3cb1",
        ) as PubkeyBytes,
      },
      address: "0x52dF0e01583E12978B0885C5836c9683f22b0618" as Address,
    },
  },
  gasPrice: {
    quantity: "20000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  gasLimit: "2100000",
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
        decimals: 12,
        symbol: "ASH",
      },
    ],
    [
      "TRASH" as TokenTicker,
      {
        contractAddress: "0xF01231195AE56d38fa03F5F2933863A2606A6052" as Address,
        decimals: 9,
        symbol: "TRASH",
        name: "Trash Token",
      },
    ],
  ]),
  erc20TransferTests: [
    {
      amount: {
        quantity: "3",
        tokenTicker: "ASH" as TokenTicker,
        fractionalDigits: 12,
      },
    },
    {
      amount: {
        quantity: "5678",
        tokenTicker: "TRASH" as TokenTicker,
        fractionalDigits: 9,
      },
    },
  ],
  expectedTokens: [
    {
      tokenTicker: "ASH" as TokenTicker,
      tokenName: "Ash Token",
      fractionalDigits: 12,
    },
    {
      tokenTicker: "ETH" as TokenTicker,
      tokenName: "Ether",
      fractionalDigits: 18,
    },
    {
      tokenTicker: "TRASH" as TokenTicker,
      tokenName: "Trash Token",
      fractionalDigits: 9,
    },
  ],
};

/** Ropsten config is not well maintained and probably outdated. Use at your won risk. */
const ropsten: EthereumNetworkConfig = {
  env: "ropsten",
  baseHttp: "https://ropsten.infura.io/",
  baseWs: "wss://ropsten.infura.io/ws",
  connectionOptions: {
    scraperApiUrl: "https://api-ropsten.etherscan.io/api",
  },
  chainId: "ethereum-eip155-3" as ChainId,
  minHeight: 4284887,
  mnemonic: "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
  accountStates: {
    default: {
      pubkey: {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
        ) as PubkeyBytes,
      },
      address: "0x88F3b5659075D0E06bB1004BE7b1a7E66F452284" as Address,
      expectedBalance: [
        {
          tokenTicker: "ETH" as TokenTicker,
          quantity: "2999979000000000000",
          fractionalDigits: 18,
        },
      ],
      expectedNonce: 1 as Nonce,
    },
    noEth: {
      address: "0x0000000000000000000000000000000000000000" as Address,
      expectedBalance: [
        // ETH balance should be listed anyway
        {
          tokenTicker: "ETH" as TokenTicker,
          quantity: "0",
          fractionalDigits: 18,
        },
      ],
    },
    unused: {
      pubkey: {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "049555be4c5136102e1645f9ce53475b2fed172078de78d3b7d0befed14f5471a077123dd459624055c93f85c0d8f99d9178b79b151f597f714ac759bca9dd3cb1",
        ) as PubkeyBytes,
      },
      address: "0x52dF0e01583E12978B0885C5836c9683f22b0618" as Address,
    },
  },
  gasPrice: {
    quantity: "1000000000",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  gasLimit: "141000",
  expectedErrorMessages: {
    insufficientFunds: /insufficient funds for gas \* price \+ value/i,
    invalidSignature: /invalid sender/i,
    gasLimitTooLow: /intrinsic gas too low/i,
  },
  erc20Tokens: new Map([]),
  erc20TransferTests: [],
  expectedTokens: [
    {
      tokenTicker: "ETH" as TokenTicker,
      tokenName: "Ether",
      fractionalDigits: 18,
    },
  ],
};

const rinkeby: EthereumNetworkConfig = {
  env: "rinkeby",
  baseHttp: "https://rinkeby.infura.io",
  baseWs: "wss://rinkeby.infura.io/ws",
  connectionOptions: {
    scraperApiUrl: "https://api-rinkeby.etherscan.io/api",
  },
  chainId: "ethereum-eip155-4" as ChainId,
  minHeight: 3211058,
  mnemonic: "retire bench island cushion panther noodle cactus keep danger assault home letter",
  accountStates: {
    default: {
      // Second account (m/44'/60'/0'/0/1) of
      // "retire bench island cushion panther noodle cactus keep danger assault home letter"
      pubkey: {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "045a977cdfa082bd486755a440b1e411a14c690fd9ac0bb6d866070f63911c54af75ae8f0f40c7069ce2df65c6facc45902d462f39e8812421502e0216da7ef51e",
        ) as PubkeyBytes,
      },
      address: "0x2eF42084759d67CA34aA910DFE22d78bbb66964f" as Address,
      expectedBalance: [
        {
          tokenTicker: "ETH" as TokenTicker,
          quantity: "1775182474000000000",
          fractionalDigits: 18,
        },
        {
          tokenTicker: "WETH" as TokenTicker,
          quantity: "1123344550000000000",
          fractionalDigits: 18,
        },
      ],
      expectedNonce: 3 as Nonce,
    },
    noEth: {
      address: "0x2244224422448877887744444444445555555555" as Address,
      expectedBalance: [
        {
          tokenTicker: "AVO" as TokenTicker,
          quantity: "7123400000000000000",
          fractionalDigits: 18,
        },
        // ETH balance should be listed anyway
        {
          tokenTicker: "ETH" as TokenTicker,
          quantity: "0",
          fractionalDigits: 18,
        },
        {
          tokenTicker: "WETH" as TokenTicker,
          quantity: "100000000000000000",
          fractionalDigits: 18,
        },
        {
          tokenTicker: "ZEENUS" as TokenTicker,
          quantity: "5",
          fractionalDigits: 0,
        },
      ],
    },
    unused: {
      pubkey: {
        algo: Algorithm.Secp256k1,
        data: fromHex(
          "049555be4c5136102e1645f9ce53475b2fed172078de78d3b7d0befed14f5471a077123dd459624055c93f85c0d8f99d9178b79b151f597f714ac759bca9dd3cb1",
        ) as PubkeyBytes,
      },
      address: "0x52dF0e01583E12978B0885C5836c9683f22b0618" as Address,
    },
  },
  gasPrice: {
    quantity: "3000000000", // 3 Gwei
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  },
  gasLimit: "141000",
  expectedErrorMessages: {
    insufficientFunds: /insufficient funds for gas \* price \+ value/i,
    invalidSignature: /invalid sender/i,
    gasLimitTooLow: /intrinsic gas too low/i,
  },
  erc20Tokens: new Map<TokenTicker, Erc20Options>([
    [
      "WETH" as TokenTicker,
      {
        contractAddress: "0xc778417e063141139fce010982780140aa0cd5ab" as Address,
        decimals: 18,
        symbol: "WETH",
      },
    ],
    [
      "AVO" as TokenTicker,
      {
        contractAddress: "0x0c8184c21a51cdb7df9e5dc415a6a54b3a39c991" as Address,
        decimals: 18,
        symbol: "AVO",
      },
    ],
    [
      // from https://ethereum.stackexchange.com/a/68072
      "ZEENUS" as TokenTicker,
      {
        contractAddress: "0x1f9061B953bBa0E36BF50F21876132DcF276fC6e" as Address,
        decimals: 0,
        symbol: "ZEENUS",
      },
    ],
  ]),
  erc20TransferTests: [
    {
      amount: {
        quantity: "123",
        tokenTicker: "AVO" as TokenTicker,
        fractionalDigits: 18,
      },
    },
    {
      amount: {
        quantity: "456",
        tokenTicker: "WETH" as TokenTicker,
        fractionalDigits: 18,
      },
    },
    {
      amount: {
        tokenTicker: "ZEENUS" as TokenTicker,
        quantity: "1",
        fractionalDigits: 0,
      },
    },
  ],
  expectedTokens: [
    {
      tokenTicker: "AVO" as TokenTicker,
      tokenName: "Avocado",
      fractionalDigits: 18,
    },
    {
      tokenTicker: "ETH" as TokenTicker,
      tokenName: "Ether",
      fractionalDigits: 18,
    },
    {
      tokenTicker: "WETH" as TokenTicker,
      tokenName: "Wrapped Ether",
      fractionalDigits: 18,
    },
    {
      tokenTicker: "ZEENUS" as TokenTicker,
      tokenName: "Zeenus 💪",
      fractionalDigits: 0,
    },
  ],
};

const config = new Map<string, EthereumNetworkConfig>();
config.set("local", local);
config.set("ropsten", ropsten);
config.set("rinkeby", rinkeby);

export const testConfig = config.get(env)!;
