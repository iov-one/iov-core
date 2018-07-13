import { Ed25519 } from "@iov/crypto";
import { PostableBytes, SignedTransaction } from "@iov/types";

import { Codec } from ".";
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
    const encoded = Codec.bytesToPost(signedTxJson);
    expect(Uint8Array.from(encoded)).toEqual(signedTxBin);
  });

  it("properly decodes transactions", () => {
    const decoded = Codec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });

  it("properly generates signbytes", async done => {
    const toSign = Codec.bytesToSign(sendTxJson, sig.nonce);
    // it should match the canonical sign bytes
    expect(toSign).toEqual(signBytes);

    // it should validate
    const pubKey = sig.publicKey.data;
    const valid = await Ed25519.verifySignature(sig.signature, toSign, pubKey);
    expect(valid).toBeTruthy();
    done();
  });

  it("generates transaction id", () => {
    const id = Codec.identifier(signedTxJson);
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
      const encoded = Codec.bytesToPost(trial);
      // Note: odd work-around.
      // If we don't do this, we get the same data back, but stored
      // as Buffer in node, rather than Uint8Array, so toEqual fails
      const noBuffer = Uint8Array.from(encoded) as PostableBytes;
      const decoded = Codec.parseBytes(noBuffer, trial.transaction.chainId);
      expect(decoded).toEqual(trial);
    }
  });
});
