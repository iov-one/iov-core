import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  Fee,
  Identity,
  Nonce,
  PostableBytes,
  PrehashType,
  PubkeyBytes,
  SendTransaction,
  SignedTransaction,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { Ed25519, Sha512 } from "@iov/crypto";
import { Encoding, TransactionEncoder } from "@iov/encoding";

import { bnsCodec } from "./bnscodec";
import {
  chainId,
  randomTxJson,
  sendTxJson,
  sendTxSignBytes,
  signedTxBin,
  signedTxJson,
  signedTxSig,
  swapAbortTxJson,
  swapClaimTxJson,
  swapOfferTxJson,
} from "./testdata.spec";
import { encodeBnsAddress } from "./util";

describe("bnscodec", () => {
  fit("generate test data", () => {
    const nonces = [0 as Nonce, 1 as Nonce, Number.MAX_SAFE_INTEGER as Nonce] as const;
    const fees: readonly (Fee | undefined)[] = [
      undefined,
      { tokens: { quantity: "0", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker } },
      { tokens: { quantity: "100000000", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker } },
    ];
    const amounts: readonly (Amount)[] = [
      { quantity: "0", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
      { quantity: "1", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
      { quantity: "1000000000", fractionalDigits: 9, tokenTicker: "CASH" as TokenTicker },
      { quantity: "7400000000", fractionalDigits: 9, tokenTicker: "IOV" as TokenTicker },
    ];
    const memos: readonly (string | undefined)[] = [undefined, "", "some text", "text with emoji: 🐎"];

    const creatorRecipientPairs: readonly { readonly creator: Identity; readonly recipient: Address }[] = [
      // Testnet
      {
        creator: {
          chainId: "iov-lovenet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "fa8c2a18b2854ab65207c0c727b825b6dbaa29379e6b2bb35ac778bfaa881e92",
            ) as PubkeyBytes,
          },
        },
        recipient: encodeBnsAddress("tiov", Encoding.fromHex("0000000000000000000000000000000000000000")),
      },
      // Mainnet
      {
        creator: {
          chainId: "iov-mainnet" as ChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: Encoding.fromHex(
              "34299fa3fe218a6210ace221f86597c800ecff3d27e1e6a7937248514a6784ee",
            ) as PubkeyBytes,
          },
        },
        recipient: encodeBnsAddress("iov", Encoding.fromHex("020daec62066ec82a5a1b40378d87457ed88e4fc")),
      },
    ];

    // tslint:disable-next-line: readonly-array
    const out: any[] = [];

    for (const nonce of nonces) {
      for (const fee of fees) {
        for (const { creator, recipient } of creatorRecipientPairs) {
          for (const amount of amounts) {
            for (const memo of memos) {
              const send: SendTransaction & WithCreator = {
                kind: "bcp/send",
                creator: creator,
                sender: bnsCodec.identityToAddress(creator),
                recipient: recipient,
                memo: memo,
                amount: amount,
                fee: fee,
              };
              const { bytes } = bnsCodec.bytesToSign(send, nonce);
              out.push({
                transaction: TransactionEncoder.toJson(send),
                nonce: nonce,
                bytes: Encoding.toHex(bytes),
              });
            }
          }
        }
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    fs.writeFileSync("data.json", JSON.stringify(out), "utf8");
  });

  it("properly encodes transactions", () => {
    const encoded = bnsCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });

  it("properly decodes transactions", () => {
    const decoded = bnsCodec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });

  it("properly generates signbytes", async () => {
    const { bytes, prehashType } = bnsCodec.bytesToSign(sendTxJson, signedTxSig.nonce);

    // it should validate
    switch (prehashType) {
      case PrehashType.Sha512: {
        // testvector is a sha512 digest of our testbytes
        const prehash = new Sha512(bytes).digest();
        expect(prehash).toEqual(sendTxSignBytes);
        const pubkey = signedTxSig.pubkey.data;
        const valid = await Ed25519.verifySignature(signedTxSig.signature, prehash, pubkey);
        expect(valid).toEqual(true);
        break;
      }
      default:
        fail("Unexpected prehash type");
    }
  });

  it("generates transaction id", () => {
    const id = bnsCodec.identifier(signedTxJson);
    expect(id).toMatch(/^[0-9A-F]{64}$/);
  });

  it("round trip works", () => {
    const transactionsToBeVerified: readonly SignedTransaction[] = [
      signedTxJson,
      randomTxJson,
      swapOfferTxJson,
      swapClaimTxJson,
      swapAbortTxJson,
    ];

    for (const trial of transactionsToBeVerified) {
      const encoded = bnsCodec.bytesToPost(trial);
      const decoded = bnsCodec.parseBytes(encoded, trial.transaction.chainId);
      expect(decoded)
        .withContext(trial.transaction.kind)
        .toEqual(trial);
    }
  });
});
