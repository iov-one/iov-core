import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { Address, Nonce, SendTx, SignedTransaction, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { amountFromComponents, serializeTransaction, toRiseTimestamp, transactionId } from "./serialization";

const { fromAscii, fromHex } = Encoding;

// use nethash as chain ID
const riseTestnet = "e90d39ac200c495b97deb6d9700745177c7fc4aa80a404108ec820cbeced054c" as ChainId;
const liskEpochAsUnixTimestamp = 1464109200;
const emptyNonce = new Long(0) as Nonce;

describe("toRiseTimestamp", () => {
  it("returns 0 at RISE epoch", () => {
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 0, 0)))).toEqual(0);
  });

  it("can encode time before epoch", () => {
    // one second
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 59, 0)))).toEqual(-1);
    // one minute
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 0, 0)))).toEqual(-60);
    // one hour
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 0, 0, 0)))).toEqual(-3600);
    // one day
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 23, 17, 0, 0, 0)))).toEqual(-86400);
  });

  it("can encode time after epoch", () => {
    // one second
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 1, 0)))).toEqual(1);
    // one minute
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 1, 0, 0)))).toEqual(60);
    // one hour
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 18, 0, 0, 0)))).toEqual(3600);
    // one day
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 25, 17, 0, 0, 0)))).toEqual(86400);
  });

  it("can encode current time", () => {
    expect(toRiseTimestamp(new ReadonlyDate(ReadonlyDate.now()))).toBeGreaterThan(73864000);
  });

  it("is not affected by the year 2038 problem", () => {
    // Example date: 2040-03-21T17:13:22Z
    //
    // Convert to unix timestamp (exceeds int32 range but Python can do it)
    // $ python3 -c 'import calendar, datetime; print(calendar.timegm(datetime.datetime(2040, 3, 21, 17, 13, 22, 0).utctimetuple()))'
    // 2215962802
    const dateIn2040 = new ReadonlyDate(ReadonlyDate.UTC(2040, 2, 21, 17, 13, 22));
    expect(toRiseTimestamp(dateIn2040)).toEqual(2215962802 - liskEpochAsUnixTimestamp);
  });

  it("throws for time 70 years before RISE epoch", () => {
    expect(() =>
      toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016 - 70, 4, 24, 17, 0, 0, 0))),
    ).toThrowError(/not in int32 range/i);
  });

  it("throws for time 70 years after RISE epoch", () => {
    expect(() =>
      toRiseTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016 + 70, 4, 24, 17, 0, 0, 0))),
    ).toThrowError(/not in int32 range/i);
  });
});

describe("amountFromComponents", () => {
  it("works for some simple values", () => {
    expect(amountFromComponents(0, 0)).toEqual(Long.fromNumber(0, true));
    expect(amountFromComponents(0, 1)).toEqual(Long.fromNumber(1, true));
    expect(amountFromComponents(0, 123)).toEqual(Long.fromNumber(123, true));
    expect(amountFromComponents(1, 0)).toEqual(Long.fromNumber(100000000, true));
    expect(amountFromComponents(123, 0)).toEqual(Long.fromNumber(12300000000, true));
    expect(amountFromComponents(1, 1)).toEqual(Long.fromNumber(100000001, true));
    expect(amountFromComponents(1, 23456789)).toEqual(Long.fromNumber(123456789, true));
  });

  it("works for 10 million lisk", () => {
    expect(amountFromComponents(10000000, 0)).toEqual(Long.fromString("1000000000000000", true, 10));
    // set high and low digit to trigger precision bugs in floating point operations
    expect(amountFromComponents(10000000, 1)).toEqual(Long.fromString("1000000000000001", true, 10));
  });

  it("works for 100 million lisk", () => {
    expect(amountFromComponents(100000000, 0)).toEqual(Long.fromString("10000000000000000", true, 10));
    // set high and low digit to trigger precision bugs in floating point operations
    expect(amountFromComponents(100000000, 1)).toEqual(Long.fromString("10000000000000001", true, 10));
  });
});

describe("serializeTransaction", () => {
  const defaultCreationDate = new ReadonlyDate((865708731 + liskEpochAsUnixTimestamp) * 1000);

  it("can serialize type 0 without memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: riseTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "RISE" as TokenTicker,
      },
      recipient: "10010344879730196491R" as Address,
    };

    const serialized = serializeTransaction(tx, defaultCreationDate);
    expect(serialized).toEqual(
      fromHex(
        "00bbaa993300112233445566778899aabbccddeeff00112233445566778899aabbccddeeff8aebe3a18b78000b15cd5b0700000000",
      ),
    );
  });

  it("fails to serialize transaction with fee", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: riseTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "RISE" as TokenTicker,
      },
      fee: {
        whole: 0,
        fractional: 0,
        tokenTicker: "RISE" as TokenTicker,
      },
      recipient: "10010344879730196491R" as Address,
    };

    expect(() => serializeTransaction(tx, defaultCreationDate)).toThrowError(/fee must not be set/i);
  });
});

describe("transactionId", () => {
  const defaultCreationDate = new ReadonlyDate((865708731 + liskEpochAsUnixTimestamp) * 1000);

  it("can calculate ID of type 0 without memo", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: riseTestnet as ChainId,
      signer: {
        algo: Algorithm.Ed25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "RISE" as TokenTicker,
      },
      recipient: "10010344879730196491R" as Address,
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
