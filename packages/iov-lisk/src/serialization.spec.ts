import { ReadonlyDate } from "readonly-date";

import { Address, Nonce, SendTx, SignedTransaction, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding, Int53 } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { amountFromComponents, serializeTransaction, transactionId } from "./serialization";

const { fromAscii, fromHex } = Encoding;

// use nethash as chain ID
const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;
const liskEpochAsUnixTimestamp = 1464109200;
const emptyNonce = new Int53(0) as Nonce;

describe("amountFromComponents", () => {
  it("works for some simple values", () => {
    expect(amountFromComponents(0, 0).toString()).toEqual("0");
    expect(amountFromComponents(0, 1).toString()).toEqual("1");
    expect(amountFromComponents(0, 123).toString()).toEqual("123");
    expect(amountFromComponents(1, 0).toString()).toEqual("100000000");
    expect(amountFromComponents(123, 0).toString()).toEqual("12300000000");
    expect(amountFromComponents(1, 1).toString()).toEqual("100000001");
    expect(amountFromComponents(1, 23456789).toString()).toEqual("123456789");
  });

  it("works for 10 million lisk", () => {
    expect(amountFromComponents(10000000, 0).toString()).toEqual("1000000000000000");
    // set high and low digit to trigger precision bugs in floating point operations
    expect(amountFromComponents(10000000, 1).toString()).toEqual("1000000000000001");
  });

  it("works for 100 million lisk", () => {
    expect(amountFromComponents(100000000, 0).toString()).toEqual("10000000000000000");
    // set high and low digit to trigger precision bugs in floating point operations
    expect(amountFromComponents(100000000, 1).toString()).toEqual("10000000000000001");
  });
});

describe("serializeTransaction", () => {
  const defaultCreationDate = new ReadonlyDate((865708731 + liskEpochAsUnixTimestamp) * 1000);

  it("can serialize type 0 without memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "LSK" as TokenTicker,
      },
      recipient: "10010344879730196491L" as Address,
    };

    const serialized = serializeTransaction(tx, defaultCreationDate);
    expect(serialized).toEqual(
      fromHex(
        "00bbaa993300112233445566778899aabbccddeeff00112233445566778899aabbccddeeff8aebe3a18b78000b15cd5b0700000000",
      ),
    );
  });

  it("can serialize type 0 with memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "LSK" as TokenTicker,
      },
      recipient: "10010344879730196491L" as Address,
      memo: "The nice memo I attach to that money for the whole world to read",
    };

    const serialized = serializeTransaction(tx, defaultCreationDate);
    expect(serialized).toEqual(
      fromHex(
        "00bbaa993300112233445566778899aabbccddeeff00112233445566778899aabbccddeeff8aebe3a18b78000b15cd5b0700000000546865206e696365206d656d6f20492061747461636820746f2074686174206d6f6e657920666f72207468652077686f6c6520776f726c6420746f2072656164",
      ),
    );
  });

  it("fails to serialize transaction with fee", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "LSK" as TokenTicker,
      },
      fee: {
        whole: 0,
        fractional: 0,
        tokenTicker: "LSK" as TokenTicker,
      },
      recipient: "10010344879730196491L" as Address,
    };

    expect(() => serializeTransaction(tx, defaultCreationDate)).toThrowError(/fee must not be set/i);
  });

  it("fails to serialize transaction with memo > 64 chars", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "LSK" as TokenTicker,
      },
      memo: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam",
      recipient: "10010344879730196491L" as Address,
    };

    expect(() => serializeTransaction(tx, defaultCreationDate)).toThrowError(/memo exceeds 64 bytes/i);
  });

  it("fails to serialize transaction with memo > 64 bytes", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "LSK" as TokenTicker,
      },
      // ⇉ (Rightwards Paired Arrows, U+21c9) takes 2 bytes in UTF-8
      memo: "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed di⇉",
      recipient: "10010344879730196491L" as Address,
    };

    expect(() => serializeTransaction(tx, defaultCreationDate)).toThrowError(/memo exceeds 64 bytes/i);
  });
});

describe("transactionId", () => {
  const defaultCreationDate = new ReadonlyDate((865708731 + liskEpochAsUnixTimestamp) * 1000);

  it("can calculate ID of type 0 without memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "LSK" as TokenTicker,
      },
      recipient: "10010344879730196491L" as Address,
    };

    const signed: SignedTransaction = {
      transaction: tx,
      primarySignature: {
        nonce: emptyNonce,
        publicKey: {
          algo: Algorithm.Ed25519,
          data: pubkey as PublicKeyBytes,
        },
        signature: fromHex("26272829") as SignatureBytes,
      },
      otherSignatures: [],
    };

    const binaryId = transactionId(signed.transaction, defaultCreationDate, signed.primarySignature);
    expect(fromAscii(binaryId)).toEqual("15806479375328957764");
  });
});
