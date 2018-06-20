import { Ed25519 } from "@iov/crypto";
import { PostableBytes, SignedTransaction } from "@iov/types";
import { Codec } from "../src";
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
  it("properly encodes transactions", async done => {
    const encoded = await Codec.bytesToPost(signedTxJson);
    expect(Uint8Array.from(encoded)).toEqual(signedTxBin);
    done();
  });

  it("properly decodes transactions", () => {
    const decoded = Codec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });

  it("properly generates signbytes", async done => {
    const toSign = await Codec.bytesToSign(sendTxJson, sig.nonce);
    // it should match the canonical sign bytes
    expect(toSign).toEqual(signBytes);

    // it should validate
    const pubKey = sig.publicKey.data;
    const valid = await Ed25519.verifySignature(sig.signature, toSign, pubKey);
    expect(valid).toBeTruthy();
    done();
  });

  it("generates transaction id", async done => {
    const id = await Codec.identifier(signedTxJson);
    expect(id).toBeTruthy();
    expect(id.length).toBe(20);
    done();
  });

  it("round trip works", async done => {
    const verify = async (trial: SignedTransaction) => {
      const encoded = await Codec.bytesToPost(trial);
      // Note: odd work-around.
      // If we don't do this, we get the same data back, but stored
      // as Buffer in node, rather than Uint8Array, so toEqual fails
      const noBuffer = Uint8Array.from(encoded) as PostableBytes;
      const decoded = Codec.parseBytes(noBuffer, trial.transaction.chainId);
      expect(decoded).toEqual(trial);
    };
    expect(async () => {
      await verify(signedTxJson);
      await verify(randomTxJson);
      await verify(setNameTxJson);
      await verify(swapCounterTxJson);
      await verify(swapClaimTxJson);
      await verify(swapTimeoutTxJson);
      done();
    }).not.toThrow();
  });
});
