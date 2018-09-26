import Long from "long";

import { Address, Nonce, SendTx, SignedTransaction, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { liskCodec } from "./liskcodec";

const { fromHex, toAscii } = Encoding;

// use nethash as chain ID
const liskTestnet = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;
const emptyNonce = new Long(0) as Nonce;

describe("liskCodec", () => {
  it("derives addresses properly", () => {
    // https://testnet-explorer.lisk.io/address/6076671634347365051L
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.ED25519,
      data: fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184") as PublicKeyBytes,
    };
    expect(liskCodec.keyToAddress(pubkey)).toEqual(toAscii("6076671634347365051L"));
  });

  it("can create bytes to post", () => {
    const pubkey = fromHex("00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff");

    const tx: SendTx = {
      chainId: liskTestnet,
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

    const bytes = liskCodec.bytesToPost(signed);
    expect(bytes).toBeTruthy();

    expect(JSON.parse(Encoding.fromUtf8(bytes))).toEqual({
      type: 0,
      timestamp: 865708731,
      amount: "123456789",
      fee: "10000000",
      recipientId: "10010344879730196491L",
      senderPublicKey: "00112233445566778899aabbccddeeff00112233445566778899aabbccddeeff",
      signature: "26272829",
      id: "15806479375328957764",
      asset: {},
    });
  });
});
