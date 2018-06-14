import { Ed25519, Encoding } from "@iov/crypto";
import { PostableBytes, SignedTransaction } from "@iov/types";
import { Codec } from "../src";
import { arraysEqual, isHashIdentifier } from "../src/util";
import {
  chainId,
  hashCode,
  randomTxJson,
  sendTxJson,
  setNameTxJson,
  sig,
  signedTxBin,
  signedTxJson,
  swapClaimTxJson,
  swapCounterTxJson,
  swapTimeoutTxJson,
} from "./testdata";

const { fromHex } = Encoding;

describe("Verify util functions", () => {
  it("verify array comparison", () => {
    const a = fromHex("12345678");
    const b = fromHex("000012345678");
    const same = arraysEqual(a, b.slice(2));
    expect(same).toBeTruthy("same");

    const different = arraysEqual(a, a.slice(0, 2));
    expect(different).toBeFalsy();
    const diff2 = arraysEqual(a.slice(0, 2), a);
    expect(diff2).toBeFalsy();
    const diff3 = arraysEqual(a, fromHex("12335678"));
    expect(diff3).toBeFalsy();
  });

  it("verify hash checks out", () => {
    const a = fromHex("1234567890abcdef1234567890abcdef");
    const badHash = isHashIdentifier(a);
    expect(badHash).toBeFalsy();
    const goodHash = isHashIdentifier(hashCode);
    expect(goodHash).toBeTruthy();
  });
});

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
    const signBytes = await Codec.bytesToSign(sendTxJson, sig.nonce);
    // it should match the signature
    const pubKey = sig.publicKey.data;
    const valid = await Ed25519.verifySignature(sig.signature, signBytes, pubKey);
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
    try {
      await verify(signedTxJson);
      await verify(randomTxJson);
      await verify(setNameTxJson);
      await verify(swapCounterTxJson);
      await verify(swapClaimTxJson);
      await verify(swapTimeoutTxJson);
    } catch (err) {
      expect(err).toBe(false);
    }
    done();
  });
});
