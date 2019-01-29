import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Nonce,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  TokenTicker,
} from "@iov/bcp-types";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";

import { Serialization } from "./serialization";

const { serializeSignedTransaction, serializeUnsignedTransaction } = Serialization;
const { fromHex } = Encoding;

describe("Serialization", () => {
  describe("serializeUnsignedTransaction", () => {
    it("can serialize transaction without memo", () => {
      const pubkey = fromHex(
        "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
      );

      const tx: SendTransaction = {
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
          tokenTicker: "ETH" as TokenTicker,
        },
        gasPrice: {
          quantity: "20000000000",
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasLimit: {
          quantity: "21000",
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
      };
      const nonce = new Int53(0) as Nonce;
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

      const tx: SendTransaction = {
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
          tokenTicker: "ETH" as TokenTicker,
        },
        gasPrice: {
          quantity: "20000000000",
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasLimit: {
          quantity: "21000",
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
        memo:
          "The nice memo I attach to that money for the whole world to read, And can encode as much data as you want, and unicode symbols like \u2764",
      };
      const nonce = new Int53(0) as Nonce;
      const serializedTx = serializeUnsignedTransaction(tx, nonce);
      expect(serializedTx).toEqual(
        fromHex(
          "f8b7808504a817c8008252089443aa18faae961c23715735682dc75662d90f4dde8901158e460913d00000b887546865206e696365206d656d6f20492061747461636820746f2074686174206d6f6e657920666f72207468652077686f6c6520776f726c6420746f20726561642c20416e642063616e20656e636f6465206173206d756368206461746120617320796f752077616e742c20616e6420756e69636f64652073796d626f6c73206c696b6520e29da48216918080",
        ),
      );
    });

    it("throws for unset gas price/limit", () => {
      const creator: PublicIdentity = {
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
        tokenTicker: "ETH" as TokenTicker,
      };
      const gasPrice: Amount = {
        quantity: "20000000000",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      };
      const gasLimit: Amount = {
        quantity: "21000",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      };
      const nonce = new Int53(0) as Nonce;

      // gasPrice unset
      {
        const tx: SendTransaction = {
          kind: "bcp/send",
          creator: creator,
          amount: amount,
          gasPrice: undefined,
          gasLimit: gasLimit,
          recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
        };
        expect(() => serializeUnsignedTransaction(tx, nonce)).toThrowError(/gasPrice must be set/i);
      }

      // gasLimit unset
      {
        const tx: SendTransaction = {
          kind: "bcp/send",
          creator: creator,
          amount: amount,
          gasPrice: gasPrice,
          gasLimit: undefined,
          recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
        };
        expect(() => serializeUnsignedTransaction(tx, nonce)).toThrowError(/gasLimit must be set/i);
      }
    });

    it("throws for negative nonce", () => {
      const creator: PublicIdentity = {
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
        tokenTicker: "ETH" as TokenTicker,
      };
      const gasPrice: Amount = {
        quantity: "20000000000",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      };
      const gasLimit: Amount = {
        quantity: "21000",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      };

      const tx: SendTransaction = {
        kind: "bcp/send",
        creator: creator,
        amount: amount,
        gasPrice: gasPrice,
        gasLimit: gasLimit,
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
      };
      expect(() => serializeUnsignedTransaction(tx, new Int53(-1) as Nonce)).toThrowError(
        /not a unsigned safe integer/i,
      );
    });
  });

  describe("serializeSignedTransaction", () => {
    it("can serialize pre-eip155 transaction compatible to external vectors", () => {
      // Data from
      // https://github.com/ethereum/tests/blob/v6.0.0-beta.3/TransactionTests/ttSignature/SenderTest.json
      // https://github.com/ethereum/tests/blob/v6.0.0-beta.3/src/TransactionTestsFiller/ttSignature/SenderTestFiller.json

      const signed: SignedTransaction<SendTransaction> = {
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
            tokenTicker: "ETH" as TokenTicker,
          },
          gasPrice: {
            quantity: "1",
            fractionalDigits: 18,
            tokenTicker: "ETH" as TokenTicker,
          },
          gasLimit: {
            quantity: "21000",
            fractionalDigits: 18,
            tokenTicker: "ETH" as TokenTicker,
          },
          recipient: "0x095e7baea6a6c7c4c2dfeb977efac326af552d87" as Address,
        },
        primarySignature: {
          nonce: new Int53(0) as Nonce,
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
  });
});
