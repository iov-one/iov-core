import Long from "long";

import { Address, Nonce, SendTx, SignedTransaction, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import {
  Algorithm,
  ChainId,
  PostableBytes,
  PublicKeyBundle,
  PublicKeyBytes,
  SignatureBytes,
} from "@iov/tendermint-types";

import { riseCodec } from "./risecodec";

const { fromHex } = Encoding;

// use nethash as chain ID
const riseTestnet = "e90d39ac200c495b97deb6d9700745177c7fc4aa80a404108ec820cbeced054c" as ChainId;
const liskEpochAsUnixTimestamp = 1464109200;
const defaultCreationTimestamp = Long.fromNumber(865708731 + liskEpochAsUnixTimestamp);

describe("riseCodec", () => {
  it("derives addresses properly", () => {
    // https://testnet-explorer.lisk.io/address/6076671634347365051L
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184") as PublicKeyBytes,
    };
    expect(riseCodec.keyToAddress(pubkey)).toEqual("6076671634347365051R");
  });

  it("can create bytes to post", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: riseTestnet,
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
        nonce: defaultCreationTimestamp as Nonce,
        publicKey: {
          algo: Algorithm.Ed25519,
          data: pubkey as PublicKeyBytes,
        },
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
    if (parsed.transaction.kind !== TransactionKind.Send) {
      throw new Error("wrong transaction kind");
    }
    expect(parsed.transaction.fee).toBeTruthy();
    expect(parsed.transaction.fee!.whole).toEqual(0);
    expect(parsed.transaction.fee!.fractional).toEqual(10000000);
    expect(parsed.transaction.fee!.tokenTicker).toEqual("RISE");
    expect(parsed.transaction.amount).toBeTruthy();
    expect(parsed.transaction.amount.whole).toEqual(1);
    expect(parsed.transaction.amount.fractional).toEqual(44550000);
    expect(parsed.transaction.amount.tokenTicker).toEqual("RISE");
    expect(parsed.transaction.signer.algo).toEqual(Algorithm.Ed25519);
    expect(parsed.transaction.signer.data).toEqual(
      fromHex("3e992130a22a124b38998887f4c791c8e4d4b9d7c21522f2dffea5d09b4d8679"),
    );
    expect(parsed.transaction.recipient).toEqual("9662024034251537644R");

    expect(parsed.primarySignature.nonce).toEqual(Long.fromNumber(
      75015345 + liskEpochAsUnixTimestamp,
    ) as Nonce);
    expect(parsed.primarySignature.publicKey.algo).toEqual(Algorithm.Ed25519);
    expect(parsed.primarySignature.publicKey.data).toEqual(
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
