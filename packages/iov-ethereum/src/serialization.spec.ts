import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Hash,
  Identity,
  Nonce,
  Preimage,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapIdBytes,
  SwapOfferTransaction,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { Erc20ApproveTransaction, Erc20Options } from "./erc20";
import { Serialization, SwapIdPrefix } from "./serialization";
import { testConfig } from "./testconfig.spec";

const { serializeSignedTransaction, serializeUnsignedTransaction } = Serialization;
const { fromHex } = Encoding;

const ETH = "ETH" as TokenTicker;
const HOT = "HOT" as TokenTicker;
const REP = "REP" as TokenTicker;

describe("Serialization", () => {
  const defaultNonce = 26 as Nonce;
  const defaultErc20Tokens = new Map<TokenTicker, Erc20Options>([
    [
      HOT,
      {
        contractAddress: "0x2020202020202020202020202020202020202020" as Address,
        symbol: HOT,
        decimals: 18,
      },
    ],
    [
      REP,
      {
        contractAddress: "0x1985365e9f78359a9b6ad760e32412f4a445e862" as Address,
        symbol: REP,
        decimals: 18,
      },
    ],
  ]);

  describe("serializeUnsignedTransaction", () => {
    it("can serialize transaction without memo", () => {
      const pubkey = fromHex(
        "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
      );

      const tx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: {
          chainId: "ethereum-eip155-5777" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: pubkey as PublicKeyBytes,
          },
        },
        amount: {
          quantity: "20000000000000000000",
          fractionalDigits: 18,
          tokenTicker: ETH,
        },
        fee: {
          gasPrice: {
            quantity: "20000000000",
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "21000",
        },
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
      };
      const nonce = 0 as Nonce;
      const serializedTx = serializeUnsignedTransaction(tx, nonce);
      expect(serializedTx).toEqual(
        fromHex(
          "ef808504a817c8008252089443aa18faae961c23715735682dc75662d90f4dde8901158e460913d00000808216918080",
        ),
      );
    });

    it("can serialize transaction with memo", () => {
      const pubkey = fromHex(
        "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
      );

      const tx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: {
          chainId: "ethereum-eip155-5777" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: pubkey as PublicKeyBytes,
          },
        },
        amount: {
          quantity: "20000000000000000000",
          fractionalDigits: 18,
          tokenTicker: ETH,
        },
        fee: {
          gasPrice: {
            quantity: "20000000000",
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "21000",
        },
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
        memo:
          "The nice memo I attach to that money for the whole world to read, And can encode as much data as you want, and unicode symbols like \u2764",
      };
      const nonce = 0 as Nonce;
      const serializedTx = serializeUnsignedTransaction(tx, nonce);
      expect(serializedTx).toEqual(
        fromHex(
          "f8b7808504a817c8008252089443aa18faae961c23715735682dc75662d90f4dde8901158e460913d00000b887546865206e696365206d656d6f20492061747461636820746f2074686174206d6f6e657920666f72207468652077686f6c6520776f726c6420746f20726561642c20416e642063616e20656e636f6465206173206d756368206461746120617320796f752077616e742c20616e6420756e69636f64652073796d626f6c73206c696b6520e29da48216918080",
        ),
      );
    });

    it("throws for unset gas price/limit", () => {
      const creator: Identity = {
        chainId: "ethereum-eip155-5777" as ChainId,
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: fromHex(
            "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
          ) as PublicKeyBytes,
        },
      };
      const amount: Amount = {
        quantity: "20000000000000000000",
        fractionalDigits: 18,
        tokenTicker: ETH,
      };
      const gasPrice: Amount = {
        quantity: "20000000000",
        fractionalDigits: 18,
        tokenTicker: ETH,
      };
      const gasLimit = "21000";
      const nonce = 0 as Nonce;

      // gasPrice unset
      {
        const tx: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: creator,
          amount: amount,
          fee: {
            gasPrice: undefined,
            gasLimit: gasLimit,
          },
          recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
        };
        expect(() => serializeUnsignedTransaction(tx, nonce)).toThrowError(/gasPrice must be set/i);
      }

      // gasLimit unset
      {
        const tx: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: creator,
          amount: amount,
          fee: {
            gasPrice: gasPrice,
            gasLimit: undefined,
          },
          recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
        };
        expect(() => serializeUnsignedTransaction(tx, nonce)).toThrowError(/gasLimit must be set/i);
      }
    });

    it("throws for negative nonce", () => {
      const creator: Identity = {
        chainId: "ethereum-eip155-5777" as ChainId,
        pubkey: {
          algo: Algorithm.Secp256k1,
          data: fromHex(
            "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
          ) as PublicKeyBytes,
        },
      };
      const amount: Amount = {
        quantity: "20000000000000000000",
        fractionalDigits: 18,
        tokenTicker: ETH,
      };
      const gasPrice: Amount = {
        quantity: "20000000000",
        fractionalDigits: 18,
        tokenTicker: ETH,
      };
      const gasLimit = "21000";

      const tx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: creator,
        amount: amount,
        fee: {
          gasPrice: gasPrice,
          gasLimit: gasLimit,
        },
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
      };
      expect(() => serializeUnsignedTransaction(tx, -1 as Nonce)).toThrowError(
        /not a unsigned safe integer/i,
      );
    });

    it("can serialize ERC20 token transfer", () => {
      // https://etherscan.io/getRawTx?tx=0x5d08a3cda172df9520f965549b4d7fc4b32baa026e8beff5293ba90c845c93b2
      // 266151.44240739 HOT from 0xc023d0f30ef630db4f4be6219608d6bcf99684f0 to 0x8fec1c262599f4169401ff48a9d63503ceaaf742
      const tx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        amount: {
          quantity: "266151442407390000000000",
          fractionalDigits: 18,
          tokenTicker: HOT,
        },
        fee: {
          gasPrice: {
            quantity: "6000000000", // 6 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "52669",
        },
        recipient: "0x8fec1c262599f4169401ff48a9d63503ceaaf742" as Address,
      };

      const expected = fromHex(
        // full length of list
        "f869" +
          // content from getRawTx with signatures stripped off
          "1a850165a0bc0082cdbd94202020202020202020202020202020202020202080b844a9059cbb0000000000000000000000008fec1c262599f4169401ff48a9d63503ceaaf74200000000000000000000000000000000000000000000385c193e12be6d312c00" +
          // chain ID = 1
          "01" +
          // zero length r
          "80" +
          // zero length s
          "80",
      );
      const serializedTx = serializeUnsignedTransaction(tx, defaultNonce, defaultErc20Tokens);
      expect(serializedTx).toEqual(expected);
    });

    it("can serialize ERC20 approval", () => {
      // https://etherscan.io/getRawTx?tx=0x4734349dd36860c9f7c981e2c673f986ade036e2b7b64dcc55f0bf0ce461daae
      // Approve maximum allowance from 0xbdfd9e1fa05c6ad0714e6f27bdb4b821ec99f7a2 to 0x4b525ae3a20021639d6e00bf752e6d2b7f65196e
      const tx: Erc20ApproveTransaction & WithCreator = {
        kind: "erc20/approve",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        amount: {
          quantity: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
          fractionalDigits: 18,
          tokenTicker: REP,
        },
        fee: {
          gasPrice: {
            quantity: "45000000000", // 45 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "100000",
        },
        spender: "0x4b525ae3a20021639d6e00bf752e6d2b7f65196e" as Address,
      };
      const nonce = 0 as Nonce;
      const expected = fromHex(
        // full length of list
        "f86a" +
          // content from getRawTx with signatures stripped off
          "80850a7a358200830186a0941985365e9f78359a9b6ad760e32412f4a445e86280b844095ea7b30000000000000000000000004b525ae3a20021639d6e00bf752e6d2b7f65196effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" +
          // chain ID = 1
          "01" +
          // zero length r
          "80" +
          // zero length s
          "80",
      );
      const serializedTx = serializeUnsignedTransaction(tx, nonce, defaultErc20Tokens);
      expect(serializedTx).toEqual(expected);
    });

    it("can serialize Ether atomic swap offer", () => {
      const transaction: SwapOfferTransaction & WithCreator = {
        kind: "bcp/swap_offer",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        amounts: [
          {
            quantity: "266151442407390000000000",
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
        ],
        fee: {
          gasPrice: {
            quantity: "6000000000", // 6 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "52669",
        },
        swapId: {
          prefix: SwapIdPrefix.Ether,
          data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
        },
        recipient: "0x8fec1c262599f4169401ff48a9d63503ceaaf742" as Address,
        hash: Uint8Array.from(Array(32).fill(8)) as Hash,
        timeout: {
          height: 1,
        },
      };

      const expected = fromHex(
        "f8b31a850165a0bc0082cdbd94e1c9ea25a621cf5c934a7e112ecab640ec7d8d188a385c193e12be6d312c00b8840eed854809090909090909090909090909090909090909090909090909090909090909090000000000000000000000008fec1c262599f4169401ff48a9d63503ceaaf74208080808080808080808080808080808080808080808080808080808080808080000000000000000000000000000000000000000000000000000000000000001018080",
      );
      const serializedTransaction = serializeUnsignedTransaction(
        transaction,
        defaultNonce,
        undefined,
        testConfig.connectionOptions.atomicSwapEtherContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize Ether atomic swap claim", () => {
      const transaction: SwapClaimTransaction & WithCreator = {
        kind: "bcp/swap_claim",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        fee: {
          gasPrice: {
            quantity: "6000000000", // 6 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "52669",
        },
        swapId: {
          prefix: SwapIdPrefix.Ether,
          data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
        },
        preimage: Uint8Array.from(Array(32).fill(16)) as Preimage,
      };

      const expected = fromHex(
        "f8691a850165a0bc0082cdbd94e1c9ea25a621cf5c934a7e112ecab640ec7d8d1880b84484cc9dfb09090909090909090909090909090909090909090909090909090909090909091010101010101010101010101010101010101010101010101010101010101010018080",
      );
      const serializedTransaction = serializeUnsignedTransaction(
        transaction,
        defaultNonce,
        undefined,
        testConfig.connectionOptions.atomicSwapEtherContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize Ether atomic swap abort", () => {
      const transaction: SwapAbortTransaction & WithCreator = {
        kind: "bcp/swap_abort",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        fee: {
          gasPrice: {
            quantity: "6000000000", // 6 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "52669",
        },
        swapId: {
          prefix: SwapIdPrefix.Ether,
          data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
        },
      };

      const expected = fromHex(
        "f8481a850165a0bc0082cdbd94e1c9ea25a621cf5c934a7e112ecab640ec7d8d1880a409d6ce0e0909090909090909090909090909090909090909090909090909090909090909018080",
      );
      const serializedTransaction = serializeUnsignedTransaction(
        transaction,
        defaultNonce,
        undefined,
        testConfig.connectionOptions.atomicSwapEtherContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize ERC20 atomic swap offer", () => {
      const transaction: SwapOfferTransaction & WithCreator = {
        kind: "bcp/swap_offer",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        amounts: [
          {
            quantity: "266151442407390000000000",
            fractionalDigits: 18,
            tokenTicker: HOT,
          },
        ],
        fee: {
          gasPrice: {
            quantity: "6000000000", // 6 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "52669",
        },
        swapId: {
          prefix: SwapIdPrefix.Erc20,
          data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
        },
        recipient: "0x8fec1c262599f4169401ff48a9d63503ceaaf742" as Address,
        hash: Uint8Array.from(Array(32).fill(8)) as Hash,
        timeout: {
          height: 1,
        },
      };

      const expected = fromHex(
        "f8e91a850165a0bc0082cdbd949768ae2339b48643d710b11ddbdb8a7edbea15bc80b8c4e8d8a29309090909090909090909090909090909090909090909090909090909090909090000000000000000000000008fec1c262599f4169401ff48a9d63503ceaaf74208080808080808080808080808080808080808080808080808080808080808080000000000000000000000000000000000000000000000000000000000000001000000000000000000000000202020202020202020202020202020202020202000000000000000000000000000000000000000000000385c193e12be6d312c00018080",
      );
      const serializedTransaction = serializeUnsignedTransaction(
        transaction,
        defaultNonce,
        defaultErc20Tokens,
        testConfig.connectionOptions.atomicSwapErc20ContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize ERC20 atomic swap claim", () => {
      const transaction: SwapClaimTransaction & WithCreator = {
        kind: "bcp/swap_claim",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        fee: {
          gasPrice: {
            quantity: "6000000000", // 6 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "52669",
        },
        swapId: {
          prefix: SwapIdPrefix.Erc20,
          data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
        },
        preimage: Uint8Array.from(Array(32).fill(16)) as Preimage,
      };

      const expected = fromHex(
        "f8691a850165a0bc0082cdbd949768ae2339b48643d710b11ddbdb8a7edbea15bc80b84484cc9dfb09090909090909090909090909090909090909090909090909090909090909091010101010101010101010101010101010101010101010101010101010101010018080",
      );
      const serializedTransaction = serializeUnsignedTransaction(
        transaction,
        defaultNonce,
        defaultErc20Tokens,
        testConfig.connectionOptions.atomicSwapErc20ContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize ERC20 atomic swap abort", () => {
      const transaction: SwapAbortTransaction & WithCreator = {
        kind: "bcp/swap_abort",
        creator: {
          chainId: "ethereum-eip155-1" as ChainId,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("") as PublicKeyBytes,
          },
        },
        fee: {
          gasPrice: {
            quantity: "6000000000", // 6 Gwei
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          gasLimit: "52669",
        },
        swapId: {
          prefix: SwapIdPrefix.Erc20,
          data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
        },
      };

      const expected = fromHex(
        "f8481a850165a0bc0082cdbd949768ae2339b48643d710b11ddbdb8a7edbea15bc80a409d6ce0e0909090909090909090909090909090909090909090909090909090909090909018080",
      );
      const serializedTransaction = serializeUnsignedTransaction(
        transaction,
        defaultNonce,
        defaultErc20Tokens,
        testConfig.connectionOptions.atomicSwapErc20ContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });
  });

  describe("serializeSignedTransaction", () => {
    it("can serialize pre-eip155 transaction compatible to external vectors", () => {
      // Data from
      // https://github.com/ethereum/tests/blob/v6.0.0-beta.3/TransactionTests/ttSignature/SenderTest.json
      // https://github.com/ethereum/tests/blob/v6.0.0-beta.3/src/TransactionTestsFiller/ttSignature/SenderTestFiller.json

      const signed: SignedTransaction<SendTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/send",
          creator: {
            chainId: "ethereum-eip155-0" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
            },
          },
          amount: {
            quantity: "10",
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
          fee: {
            gasPrice: {
              quantity: "1",
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "21000",
          },
          recipient: "0x095e7baea6a6c7c4c2dfeb977efac326af552d87" as Address,
        },
        primarySignature: {
          nonce: 0 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("48b55bfa915ac795c431978d8a6a992b628d557da5ff759b307d495a36649353"),
            fromHex("1fffd310ac743f371de3b9f7f9cb56c0b28ad43601b4ab949f53faa07bd2c804"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };

      const serializedTx = serializeSignedTransaction(signed);
      expect(serializedTx).toEqual(
        fromHex(
          "f85f800182520894095e7baea6a6c7c4c2dfeb977efac326af552d870a801ba048b55bfa915ac795c431978d8a6a992b628d557da5ff759b307d495a36649353a01fffd310ac743f371de3b9f7f9cb56c0b28ad43601b4ab949f53faa07bd2c804",
        ),
      );
    });

    it("can serialize ERC20 token transfer", () => {
      // https://etherscan.io/getRawTx?tx=0x5d08a3cda172df9520f965549b4d7fc4b32baa026e8beff5293ba90c845c93b2
      // 266151.44240739 HOT from 0xc023d0f30ef630db4f4be6219608d6bcf99684f0 to 0x8fec1c262599f4169401ff48a9d63503ceaaf742
      const signed: SignedTransaction<SendTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/send",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: fromHex("") as PublicKeyBytes,
            },
          },
          amount: {
            quantity: "266151442407390000000000",
            fractionalDigits: 18,
            tokenTicker: "HOT" as TokenTicker,
          },
          fee: {
            gasPrice: {
              quantity: "6000000000", // 6 Gwei
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "52669",
          },
          recipient: "0x8fec1c262599f4169401ff48a9d63503ceaaf742" as Address,
        },
        primarySignature: {
          nonce: defaultNonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("6a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37"),
            fromHex("443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };
      const expected = fromHex(
        "f8a91a850165a0bc0082cdbd946c6ee5e31d828de241282b9606c8e98ea48526e280b844a9059cbb0000000000000000000000008fec1c262599f4169401ff48a9d63503ceaaf74200000000000000000000000000000000000000000000385c193e12be6d312c0025a06a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37a0443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d",
      );

      const erc20Tokens = new Map<TokenTicker, Erc20Options>([
        [
          HOT,
          {
            contractAddress: "0x6c6ee5e31d828de241282b9606c8e98ea48526e2" as Address,
            symbol: HOT,
            decimals: 18,
          },
        ],
      ]);
      const serializedTx = serializeSignedTransaction(signed, erc20Tokens);
      expect(serializedTx).toEqual(expected);
    });

    it("can serialize Ether atomic swap offer", () => {
      const signed: SignedTransaction<SwapOfferTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/swap_offer",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: fromHex("") as PublicKeyBytes,
            },
          },
          amounts: [
            {
              quantity: "266151442407390000000000",
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
          ],
          fee: {
            gasPrice: {
              quantity: "6000000000", // 6 Gwei
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "52669",
          },
          swapId: {
            prefix: SwapIdPrefix.Ether,
            data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
          },
          recipient: "0x8fec1c262599f4169401ff48a9d63503ceaaf742" as Address,
          hash: Uint8Array.from(Array(32).fill(8)) as Hash,
          timeout: {
            height: 1,
          },
        },
        primarySignature: {
          nonce: defaultNonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("6a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37"),
            fromHex("443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };
      const expected = fromHex(
        "f8f31a850165a0bc0082cdbd94e1c9ea25a621cf5c934a7e112ecab640ec7d8d188a385c193e12be6d312c00b8840eed854809090909090909090909090909090909090909090909090909090909090909090000000000000000000000008fec1c262599f4169401ff48a9d63503ceaaf7420808080808080808080808080808080808080808080808080808080808080808000000000000000000000000000000000000000000000000000000000000000125a06a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37a0443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d",
      );

      const serializedTransaction = serializeSignedTransaction(
        signed,
        undefined,
        testConfig.connectionOptions.atomicSwapEtherContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize Ether atomic swap claim", () => {
      const signed: SignedTransaction<SwapClaimTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/swap_claim",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: fromHex("") as PublicKeyBytes,
            },
          },
          fee: {
            gasPrice: {
              quantity: "6000000000", // 6 Gwei
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "52669",
          },
          swapId: {
            prefix: SwapIdPrefix.Ether,
            data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
          },
          preimage: Uint8Array.from(Array(32).fill(16)) as Preimage,
        },
        primarySignature: {
          nonce: defaultNonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("6a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37"),
            fromHex("443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };
      const expected = fromHex(
        "f8a91a850165a0bc0082cdbd94e1c9ea25a621cf5c934a7e112ecab640ec7d8d1880b84484cc9dfb0909090909090909090909090909090909090909090909090909090909090909101010101010101010101010101010101010101010101010101010101010101025a06a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37a0443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d",
      );

      const serializedTransaction = serializeSignedTransaction(
        signed,
        undefined,
        testConfig.connectionOptions.atomicSwapEtherContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize Ether atomic swap abort", () => {
      const signed: SignedTransaction<SwapAbortTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/swap_abort",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: fromHex("") as PublicKeyBytes,
            },
          },
          fee: {
            gasPrice: {
              quantity: "6000000000", // 6 Gwei
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "52669",
          },
          swapId: {
            prefix: SwapIdPrefix.Ether,
            data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
          },
        },
        primarySignature: {
          nonce: defaultNonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("6a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37"),
            fromHex("443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };
      const expected = fromHex(
        "f8881a850165a0bc0082cdbd94e1c9ea25a621cf5c934a7e112ecab640ec7d8d1880a409d6ce0e090909090909090909090909090909090909090909090909090909090909090925a06a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37a0443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d",
      );

      const serializedTransaction = serializeSignedTransaction(
        signed,
        undefined,
        testConfig.connectionOptions.atomicSwapEtherContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize ERC20 atomic swap offer", () => {
      const signed: SignedTransaction<SwapOfferTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/swap_offer",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: fromHex("") as PublicKeyBytes,
            },
          },
          amounts: [
            {
              quantity: "266151442407390000000000",
              fractionalDigits: 18,
              tokenTicker: HOT,
            },
          ],
          fee: {
            gasPrice: {
              quantity: "6000000000", // 6 Gwei
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "52669",
          },
          swapId: {
            prefix: SwapIdPrefix.Erc20,
            data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
          },
          recipient: "0x8fec1c262599f4169401ff48a9d63503ceaaf742" as Address,
          hash: Uint8Array.from(Array(32).fill(8)) as Hash,
          timeout: {
            height: 1,
          },
        },
        primarySignature: {
          nonce: defaultNonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("6a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37"),
            fromHex("443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };
      const expected = fromHex(
        "f901291a850165a0bc0082cdbd949768ae2339b48643d710b11ddbdb8a7edbea15bc80b8c4e8d8a29309090909090909090909090909090909090909090909090909090909090909090000000000000000000000008fec1c262599f4169401ff48a9d63503ceaaf74208080808080808080808080808080808080808080808080808080808080808080000000000000000000000000000000000000000000000000000000000000001000000000000000000000000202020202020202020202020202020202020202000000000000000000000000000000000000000000000385c193e12be6d312c0025a06a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37a0443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d",
      );

      const serializedTransaction = serializeSignedTransaction(
        signed,
        defaultErc20Tokens,
        testConfig.connectionOptions.atomicSwapErc20ContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize ERC20 atomic swap claim", () => {
      const signed: SignedTransaction<SwapClaimTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/swap_claim",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: fromHex("") as PublicKeyBytes,
            },
          },
          fee: {
            gasPrice: {
              quantity: "6000000000", // 6 Gwei
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "52669",
          },
          swapId: {
            prefix: SwapIdPrefix.Erc20,
            data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
          },
          preimage: Uint8Array.from(Array(32).fill(16)) as Preimage,
        },
        primarySignature: {
          nonce: defaultNonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("6a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37"),
            fromHex("443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };
      const expected = fromHex(
        "f8a91a850165a0bc0082cdbd949768ae2339b48643d710b11ddbdb8a7edbea15bc80b84484cc9dfb0909090909090909090909090909090909090909090909090909090909090909101010101010101010101010101010101010101010101010101010101010101025a06a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37a0443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d",
      );

      const serializedTransaction = serializeSignedTransaction(
        signed,
        defaultErc20Tokens,
        testConfig.connectionOptions.atomicSwapErc20ContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });

    it("can serialize ERC20 atomic swap abort", () => {
      const signed: SignedTransaction<SwapAbortTransaction & WithCreator> = {
        transaction: {
          kind: "bcp/swap_abort",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: fromHex("") as PublicKeyBytes,
            },
          },
          fee: {
            gasPrice: {
              quantity: "6000000000", // 6 Gwei
              fractionalDigits: 18,
              tokenTicker: ETH,
            },
            gasLimit: "52669",
          },
          swapId: {
            prefix: SwapIdPrefix.Erc20,
            data: Uint8Array.from(Array(32).fill(9)) as SwapIdBytes,
          },
        },
        primarySignature: {
          nonce: defaultNonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: new Uint8Array([]) as PublicKeyBytes, // unused for serialization
          },
          signature: new ExtendedSecp256k1Signature(
            fromHex("6a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37"),
            fromHex("443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      };
      const expected = fromHex(
        "f8881a850165a0bc0082cdbd949768ae2339b48643d710b11ddbdb8a7edbea15bc80a409d6ce0e090909090909090909090909090909090909090909090909090909090909090925a06a6bbd9d45779c81a24172a1c90e9790033cce1fd6893a49ac31d972e436ee37a0443fbc313ff9e4399da1b285bd3f9b9c776349b61d0334c83f4eb51ba67a0a7d",
      );

      const serializedTransaction = serializeSignedTransaction(
        signed,
        defaultErc20Tokens,
        testConfig.connectionOptions.atomicSwapErc20ContractAddress,
      );
      expect(serializedTransaction).toEqual(expected);
    });
  });
});
