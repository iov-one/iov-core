import { Address, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, PublicKeyBytes } from "@iov/tendermint-types";

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
          tokenTicker: "ETH" as TokenTicker,
        },
        gasPrice: {
          whole: 0,
          fractional: 20000000000,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasLimit: {
          whole: 0,
          fractional: 21000,
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
  });
});
