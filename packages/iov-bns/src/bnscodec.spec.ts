import { SignedTransaction } from "@iov/bcp-types";
import { Ed25519 } from "@iov/crypto";
import { PostableBytes } from "@iov/tendermint-types";

import { bnsCodec } from "./bnscodec";
import {
  chainId,
  randomTxJson,
  sendTxJson,
  setNameTxJson,
  sig,
  signBytes,
  signedTxBin,
  signedTxJson,
  swapClaimTxJson,
  swapCounterTxJson,
  swapTimeoutTxJson,
} from "./testdata";

describe("Check codec", () => {
  it("properly encodes transactions", () => {
    const encoded = bnsCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });

  it("properly decodes transactions", () => {
    const decoded = bnsCodec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });

  it("properly generates signbytes", async () => {
    const { bytes: toSign } = bnsCodec.bytesToSign(sendTxJson, sig.nonce);
    // it should match the canonical sign bytes
    expect(toSign).toEqual(signBytes);

    // it should validate
    const pubKey = sig.publicKey.data;
    const valid = await Ed25519.verifySignature(sig.signature, toSign, pubKey);
    expect(valid).toBeTruthy();
  });

  it("generates transaction id", () => {
    const id = bnsCodec.identifier(signedTxJson);
    expect(id).toBeTruthy();
    expect(id.length).toBe(20);
  });

  it("round trip works", () => {
    const transactionsToBeVerified: ReadonlyArray<SignedTransaction> = [
      signedTxJson,
      randomTxJson,
      setNameTxJson,
      swapCounterTxJson,
      swapClaimTxJson,
      swapTimeoutTxJson,
    ];

    for (const trial of transactionsToBeVerified) {
      const encoded = bnsCodec.bytesToPost(trial);
      const decoded = bnsCodec.parseBytes(encoded, trial.transaction.chainId);
      expect(decoded).toEqual(trial);
    }
  });
});
