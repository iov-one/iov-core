import { PostableBytes, PrehashType, SignedTransaction } from "@iov/bcp";
import { Ed25519, Sha512 } from "@iov/crypto";

import { bnsCodec } from "./bnscodec";
import {
  chainId,
  randomTxJson,
  sendTxJson,
  sig,
  signBytes,
  signedTxBin,
  signedTxJson,
  swapClaimTxJson,
  swapOfferTxJson,
  swapTimeoutTxJson,
} from "./testdata.spec";

describe("bnscodec", () => {
  it("properly encodes transactions", () => {
    const encoded = bnsCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });

  it("properly decodes transactions", () => {
    const decoded = bnsCodec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });

  it("properly generates signbytes", async () => {
    const { bytes, prehashType } = bnsCodec.bytesToSign(sendTxJson, sig.nonce);

    // it should validate
    switch (prehashType) {
      case PrehashType.Sha512:
        // testvector is a sha512 digest of our testbytes
        const prehash = new Sha512(bytes).digest();
        expect(prehash).toEqual(signBytes);
        const pubkey = sig.pubkey.data;
        // const prehash = new Sha512(bytes).digest();
        const valid = await Ed25519.verifySignature(sig.signature, prehash, pubkey);
        expect(valid).toEqual(true);
        break;
      default:
        fail("Unexpected prehash type");
    }
  });

  it("generates transaction id", () => {
    const id = bnsCodec.identifier(signedTxJson);
    expect(id).toMatch(/^[0-9A-F]{64}$/);
  });

  it("round trip works", () => {
    const transactionsToBeVerified: ReadonlyArray<SignedTransaction> = [
      signedTxJson,
      randomTxJson,
      swapOfferTxJson,
      swapClaimTxJson,
      swapTimeoutTxJson,
    ];

    for (const trial of transactionsToBeVerified) {
      const encoded = bnsCodec.bytesToPost(trial);
      const decoded = bnsCodec.parseBytes(encoded, trial.transaction.creator.chainId);
      expect(decoded)
        .withContext(trial.transaction.kind)
        .toEqual(trial);
    }
  });
});
