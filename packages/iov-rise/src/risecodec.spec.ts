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

const { fromHex, toAscii } = Encoding;

// use nethash as chain ID
const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;
const liskEpochAsUnixTimestamp = 1464109200;
const defaultCreationTimestamp = Long.fromNumber(865708731 + liskEpochAsUnixTimestamp);

describe("liskCodec", () => {
  it("derives addresses properly", () => {
    // https://testnet-explorer.lisk.io/address/6076671634347365051L
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.ED25519,
      data: fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184") as PublicKeyBytes,
    };
    expect(riseCodec.keyToAddress(pubkey)).toEqual(toAscii("6076671634347365051R"));
  });

  it("can create bytes to post", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet,
      signer: {
        algo: Algorithm.ED25519,
        data: pubkey as PublicKeyBytes,
      },
      kind: TransactionKind.Send,
      amount: {
        whole: 1,
        fractional: 23456789,
        tokenTicker: "RISE" as TokenTicker,
      },
      recipient: toAscii("10010344879730196491R") as Address,
    };

    const signed: SignedTransaction = {
      transaction: tx,
      primarySignature: {
        nonce: defaultCreationTimestamp as Nonce,
        publicKey: {
          algo: Algorithm.ED25519,
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
      senderPublicKey: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
      signature: "26272829",
      id: "15806479375328957764",
    });
  });

  it("can parse transaction", () => {
    // curl -s 'https://testnet.lisk.io/api/transactions?id=9181508057602672832' | jq '.data[0]'
    const serialized = Encoding.toUtf8(`
      {
        "id": "9181508057602672832",
        "height": 6309471,
        "blockId": "1008284795900419624",
        "type": 0,
        "timestamp": 73863961,
        "senderPublicKey": "06ad4341a609af2de837e1156f81849b05bf3c280940a9f45db76d09a3a3f2fa",
        "senderId": "10176009299933723198R",
        "recipientId": "6076671634347365051R",
        "recipientPublicKey": "f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184",
        "amount": 244550000,
        "fee": 10000000,
        "signature": "9a6c75056151d76791b69d268102241aa0f5930d098a1af48bab9b6e7706afcf24156ae2a7178cf1c3b7865094653dcaf99cdd7cb7aa9a8a3e5c4121f2a44a00",
        "signatures": [],
        "confirmations": 101
      }
    `) as PostableBytes;

    const parsed = riseCodec.parseBytes(serialized, liskTestnet);
    if (parsed.transaction.kind !== TransactionKind.Send) {
      throw new Error("wrong transaction kind");
    }
    expect(parsed.transaction.fee).toBeTruthy();
    expect(parsed.transaction.fee!.whole).toEqual(0);
    expect(parsed.transaction.fee!.fractional).toEqual(10000000);
    expect(parsed.transaction.fee!.tokenTicker).toEqual("RISE");
    expect(parsed.transaction.amount).toBeTruthy();
    expect(parsed.transaction.amount.whole).toEqual(2);
    expect(parsed.transaction.amount.fractional).toEqual(44550000);
    expect(parsed.transaction.amount.tokenTicker).toEqual("RISE");
    expect(parsed.transaction.signer.algo).toEqual(Algorithm.ED25519);
    expect(parsed.transaction.signer.data).toEqual(
      fromHex("06ad4341a609af2de837e1156f81849b05bf3c280940a9f45db76d09a3a3f2fa"),
    );
    expect(parsed.transaction.recipient).toEqual(toAscii("6076671634347365051R"));

    expect(parsed.primarySignature.nonce).toEqual(Long.fromNumber(
      73863961 + liskEpochAsUnixTimestamp,
    ) as Nonce);
    expect(parsed.primarySignature.publicKey.algo).toEqual(Algorithm.ED25519);
    expect(parsed.primarySignature.publicKey.data).toEqual(
      fromHex("06ad4341a609af2de837e1156f81849b05bf3c280940a9f45db76d09a3a3f2fa"),
    );
    expect(parsed.primarySignature.signature).toEqual(
      fromHex(
        "9a6c75056151d76791b69d268102241aa0f5930d098a1af48bab9b6e7706afcf24156ae2a7178cf1c3b7865094653dcaf99cdd7cb7aa9a8a3e5c4121f2a44a00",
      ),
    );
    expect(parsed.otherSignatures).toEqual([]);
  });
});
