import Long from "long";

import { Address, Nonce, SendTx, SignedTransaction, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { serializeTransaction, transactionId } from "./serialization";

const { fromAscii, fromHex, toAscii } = Encoding;

// use nethash as chain ID
const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;
const emptyNonce = new Long(0) as Nonce;

describe("serializeTransaction", () => {
  it("can serialize type 0 without memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
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

    const serialized = serializeTransaction(tx);
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

    const serialized = serializeTransaction(tx);
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
      fee: {
        whole: 0,
        fractional: 0,
        tokenTicker: "LSK" as TokenTicker,
      },
      recipient: toAscii("10010344879730196491L") as Address,
    };

    expect(() => serializeTransaction(tx)).toThrowError(/fee must not be set/i);
  });
});

describe("transactionId", () => {
  it("can calculate ID of type 0 without memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet as ChainId,
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

    const signed: SignedTransaction = {
      transaction: tx,
      primarySignature: {
        nonce: emptyNonce,
        publicKey: {
          algo: Algorithm.ED25519,
          data: pubkey as PublicKeyBytes,
        },
        signature: fromHex("26272829") as SignatureBytes,
      },
      otherSignatures: [],
    };

    const binaryId = transactionId(signed.transaction, signed.primarySignature);
    expect(fromAscii(binaryId)).toEqual("15806479375328957764");
  });
});
