import Long from "long";

import { Address, Nonce, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";

import { liskCodec } from "./liskcodec";

const { fromHex, toAscii } = Encoding;

describe("liskCodec", () => {
  it("derives addresses properly", () => {
    // https://testnet-explorer.lisk.io/address/6076671634347365051L
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.ED25519,
      data: fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184") as PublicKeyBytes,
    };
    expect(liskCodec.keyToAddress(pubkey)).toEqual(toAscii("6076671634347365051L"));
  });

  describe("transaction serialization", () => {
    it("can serialize type 0 without memo", () => {
      const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

      const tx: SendTx = {
        chainId: "Lisk" as ChainId,
        fee: {
          whole: 0,
          fractional: 10000000,
          tokenTicker: "LSK" as TokenTicker,
        },
        signer: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        timestamp: 865708731,
        kind: TransactionKind.Send,
        amount: {
          whole: 1,
          fractional: 23456789,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: toAscii("10010344879730196491L") as Address,
      };
      const nonce = new Long(0) as Nonce;

      const serialized = liskCodec.bytesToSign(tx, nonce).bytes;
      expect(serialized).toEqual(
        fromHex(
          "00bbaa993300112233445566778899aabbccddeeff00112233445566778899aabbccddeeff8aebe3a18b78000b15cd5b0700000000",
        ),
      );
    });

    it("can serialize type 0 with memo", () => {
      const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

      const tx: SendTx = {
        chainId: "Lisk" as ChainId,
        fee: {
          whole: 0,
          fractional: 10000000,
          tokenTicker: "LSK" as TokenTicker,
        },
        signer: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        timestamp: 865708731,
        kind: TransactionKind.Send,
        amount: {
          whole: 1,
          fractional: 23456789,
          tokenTicker: "LSK" as TokenTicker,
        },
        recipient: toAscii("10010344879730196491L") as Address,
        memo: "The nice memo I attach to that money for the whole world to read",
      };
      const nonce = new Long(0) as Nonce;

      const serialized = liskCodec.bytesToSign(tx, nonce).bytes;
      expect(serialized).toEqual(
        fromHex(
          "00bbaa993300112233445566778899aabbccddeeff00112233445566778899aabbccddeeff8aebe3a18b78000b15cd5b0700000000546865206e696365206d656d6f20492061747461636820746f2074686174206d6f6e657920666f72207468652077686f6c6520776f726c6420746f2072656164",
        ),
      );
    });
  });
});
