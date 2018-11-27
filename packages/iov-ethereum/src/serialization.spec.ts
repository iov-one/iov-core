import { Algorithm, PublicKeyBytes } from "@iov/base-types";
import { Address, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";

import { Serialization } from "./serialization";
import { TestConfig } from "./testconfig";

const { amountFromComponents, serializeTransaction } = Serialization;
const { fromHex } = Encoding;

describe("Serialization", () => {
  describe("amountFromComponents", () => {
    it("works for some simple values", () => {
      expect(amountFromComponents(0, 0)).toEqual("0");
      expect(amountFromComponents(0, 1)).toEqual("1");
      expect(amountFromComponents(0, 123)).toEqual("123");
      expect(amountFromComponents(1, 0)).toEqual("1000000000000000000");
      expect(amountFromComponents(123, 0)).toEqual("123000000000000000000");
      expect(amountFromComponents(1, 1)).toEqual("1000000000000000001");
      expect(amountFromComponents(1, 23456789)).toEqual("1000000000023456789");
      // move whole and fractional to string
      // expect(amountFromComponents(1, 234567890123456789)).toEqual("1234567890123456789");
    });

    it("works for amount 10 million", () => {
      expect(amountFromComponents(10000000, 0)).toEqual("10000000000000000000000000");
      expect(amountFromComponents(10000000, 1)).toEqual("10000000000000000000000001");
    });

    it("works for amount 100 million", () => {
      expect(amountFromComponents(100000000, 0)).toEqual("100000000000000000000000000");
      expect(amountFromComponents(100000000, 1)).toEqual("100000000000000000000000001");
    });
  });

  describe("serializeTransaction", () => {
    it("can serialize transaction without memo", () => {
      const pubkey = fromHex(
        "044bc2a31265153f07e70e0bab08724e6b85e217f8cd628ceb62974247bb493382ce28cab79ad7119ee1ad3ebcdb98a16805211530ecc6cfefa1b88e6dff99232a",
      );

      const tx: SendTx = {
        chainId: TestConfig.chainId,
        signer: {
          algo: Algorithm.Secp256k1,
          data: pubkey as PublicKeyBytes,
        },
        kind: TransactionKind.Send,
        amount: {
          whole: 20,
          fractional: 0,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasPrice: {
          whole: 0,
          fractional: 20000000000,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasLimit: {
          whole: 0,
          fractional: 21000,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
      };
      const serializedTx = serializeTransaction(tx, TestConfig.nonce);
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

      const tx: SendTx = {
        chainId: TestConfig.chainId,
        signer: {
          algo: Algorithm.Secp256k1,
          data: pubkey as PublicKeyBytes,
        },
        kind: TransactionKind.Send,
        amount: {
          whole: 20,
          fractional: 0,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasPrice: {
          whole: 0,
          fractional: 20000000000,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasLimit: {
          whole: 0,
          fractional: 21000,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        recipient: "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address,
        memo:
          "The nice memo I attach to that money for the whole world to read, And can encode as much data as you want, and unicode symbols like \u2764",
      };
      const serializedTx = serializeTransaction(tx, TestConfig.nonce);
      expect(serializedTx).toEqual(
        fromHex(
          "f8b7808504a817c8008252089443aa18faae961c23715735682dc75662d90f4dde8901158e460913d00000b887546865206e696365206d656d6f20492061747461636820746f2074686174206d6f6e657920666f72207468652077686f6c6520776f726c6420746f20726561642c20416e642063616e20656e636f6465206173206d756368206461746120617320796f752077616e742c20616e6420756e69636f64652073796d626f6c73206c696b6520e29da48216918080",
        ),
      );
    });
  });
});
