import {
  Address,
  Algorithm,
  ChainId,
  Identity,
  isSendTransaction,
  Nonce,
  PostableBytes,
  PubkeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { riseCodec } from "./risecodec";

const { fromHex } = Encoding;

const riseTestnet = "rise-296dc9a4d1" as ChainId;
const riseEpochAsUnixTimestamp = 1464109200;
const defaultCreationTimestamp = 865708731 + riseEpochAsUnixTimestamp;
const defaultPublicKey = {
  algo: Algorithm.Ed25519,
  data: fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff") as PubkeyBytes,
};
const defaultCreator = {
  chainId: riseTestnet,
  pubkey: defaultPublicKey,
};
const defaultSender = "10645226540143571783L" as Address;
const defaultRecipient = "10010344879730196491R" as Address;
const defaultAmount = {
  quantity: "123456789",
  fractionalDigits: 8,
  tokenTicker: "RISE" as TokenTicker,
};

describe("riseCodec", () => {
  it("derives addresses properly", () => {
    // https://texplorer.rise.vision/address/10145108642177909005R
    const identity: Identity = {
      chainId: riseTestnet,
      pubkey: {
        algo: Algorithm.Ed25519,
        data: fromHex("34770ce843a01d975773ba2557b6643b32fe088818d343df2c32cbb89b286b3f") as PubkeyBytes,
      },
    };
    expect(riseCodec.identityToAddress(identity)).toEqual("10145108642177909005R");
  });

  it("can create bytes to sign", () => {
    const tx: SendTransaction & WithCreator = {
      kind: "bcp/send",
      creator: defaultCreator,
      amount: defaultAmount,
      sender: defaultSender,
      recipient: defaultRecipient,
    };
    const bytes = riseCodec.bytesToSign(tx, defaultCreationTimestamp as Nonce);
    expect(bytes).toBeTruthy();
  });

  it("requires 8 fractional digits in bytes to sign", () => {
    const tx: SendTransaction & WithCreator = {
      kind: "bcp/send",
      creator: defaultCreator,
      amount: {
        ...defaultAmount,
        fractionalDigits: 6,
      },
      sender: defaultSender,
      recipient: defaultRecipient,
    };
    expect(() => riseCodec.bytesToSign(tx, defaultCreationTimestamp as Nonce)).toThrowError(/Requires 8/);
  });

  it("can create bytes to post", () => {
    const tx: SendTransaction & WithCreator = {
      kind: "bcp/send",
      creator: defaultCreator,
      amount: defaultAmount,
      sender: defaultSender,
      recipient: defaultRecipient,
    };

    const signed: SignedTransaction = {
      transaction: tx,
      primarySignature: {
        nonce: defaultCreationTimestamp as Nonce,
        pubkey: defaultPublicKey,
        signature: fromHex("26272829") as SignatureBytes,
      },
      otherSignatures: [],
    };

    const bytes = riseCodec.bytesToPost(signed);
    expect(bytes).toBeTruthy();
    expect(JSON.parse(Encoding.fromUtf8(bytes))).toEqual({
      type: 0,
      timestamp: 865708731,
      amount: 123456789,
      fee: 10000000,
      recipientId: "10010344879730196491R",
      senderId: "10645226540143571783R",
      senderPublicKey: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
      signature: "26272829",
      id: "15806479375328957764",
    });
  });

  it("can parse transaction", () => {
    // curl -s 'https://twallet.rise.vision/api/transactions/get?id=7547689790128766679' | jq '.transaction'
    const serialized = Encoding.toUtf8(`
    {
      "signatures": [],
      "id": "7547689790128766679",
      "rowId": 17705,
      "height": 1031613,
      "blockId": "7680780071801920036",
      "type": 0,
      "timestamp": 75015345,
      "senderPublicKey": "3e992130a22a124b38998887f4c791c8e4d4b9d7c21522f2dffea5d09b4d8679",
      "senderId": "13640984096060415228R",
      "recipientId": "9662024034251537644R",
      "amount": 144550000,
      "fee": 10000000,
      "signature": "a42e0d7c7110d9c104deaa801708820c7a8625b370cfe7d07fa613af5989c660a1cda55fc2afb1cf9b7c248a506d731ec91e49ec4d9ac6e0210f7fa13e85e60d",
      "signSignature": null,
      "requesterPublicKey": null,
      "asset": null,
      "confirmations": 1811
    }
    `) as PostableBytes;

    const parsed = riseCodec.parseBytes(serialized, riseTestnet);
    const unsigned = parsed.transaction;
    if (!isSendTransaction(unsigned)) {
      throw new Error("wrong transaction kind");
    }
    expect(unsigned.fee).toBeTruthy();
    expect(unsigned.fee!.tokens).toBeTruthy();
    expect(unsigned.fee!.tokens!.quantity).toEqual("10000000");
    expect(unsigned.fee!.tokens!.fractionalDigits).toEqual(8);
    expect(unsigned.fee!.tokens!.tokenTicker).toEqual("RISE");
    expect(unsigned.amount).toBeTruthy();
    expect(unsigned.amount.quantity).toEqual("144550000");
    expect(unsigned.amount.fractionalDigits).toEqual(8);
    expect(unsigned.amount.tokenTicker).toEqual("RISE");
    expect(unsigned.creator.chainId).toEqual(riseTestnet);
    expect(unsigned.creator.pubkey.algo).toEqual(Algorithm.Ed25519);
    expect(unsigned.creator.pubkey.data).toEqual(
      fromHex("3e992130a22a124b38998887f4c791c8e4d4b9d7c21522f2dffea5d09b4d8679"),
    );
    expect(unsigned.recipient).toEqual("9662024034251537644R");

    expect(parsed.primarySignature.nonce).toEqual((75015345 + riseEpochAsUnixTimestamp) as Nonce);
    expect(parsed.primarySignature.pubkey.algo).toEqual(Algorithm.Ed25519);
    expect(parsed.primarySignature.pubkey.data).toEqual(
      fromHex("3e992130a22a124b38998887f4c791c8e4d4b9d7c21522f2dffea5d09b4d8679"),
    );
    expect(parsed.primarySignature.signature).toEqual(
      fromHex(
        "a42e0d7c7110d9c104deaa801708820c7a8625b370cfe7d07fa613af5989c660a1cda55fc2afb1cf9b7c248a506d731ec91e49ec4d9ac6e0210f7fa13e85e60d",
      ),
    );
    expect(parsed.otherSignatures).toEqual([]);
  });
});
