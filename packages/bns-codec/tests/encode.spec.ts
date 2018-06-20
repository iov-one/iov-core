import { Ed25519 } from "@iov/crypto";

import * as codec from "../src/codec";
import { buildMsg, buildSignedTx, buildUnsignedTx } from "../src/encode";
import { encodePrivKey, encodePubKey, encodeToken } from "../src/types";
import { appendSignBytes, keyToAddress } from "../src/util";

import {
  address,
  coinBin,
  coinJson,
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  sig,
  signBytes,
  signedTxBin,
  signedTxJson,
} from "./testdata";

describe("Encode helpers", () => {
  it("encode pubkey", () => {
    const pubkey: codec.crypto.IPublicKey = encodePubKey(pubJson);
    const encoded = codec.crypto.PublicKey.encode(pubkey).finish();
    // force result into Uint8Array for tests so it passes
    // if buffer of correct type as well
    expect(Uint8Array.from(encoded)).toEqual(pubBin);
  });

  it("create address", async done => {
    const calc = await keyToAddress(pubJson);
    expect(Uint8Array.from(calc)).toEqual(address);
    done();
  });

  it("encode private key", () => {
    const privkey = encodePrivKey(privJson);
    const encoded = codec.crypto.PublicKey.encode(privkey).finish();
    expect(Uint8Array.from(encoded)).toEqual(privBin);
  });

  it("encode coin", () => {
    const token = encodeToken(coinJson);
    const encoded = codec.x.Coin.encode(token).finish();
    expect(Uint8Array.from(encoded)).toEqual(coinBin);
  });
});

describe("Encode transactions", () => {
  it("encodes unsigned message", async done => {
    const tx = await buildMsg(sendTxJson);
    const encoded = codec.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
    done();
  });

  it("encodes unsigned transaction", async done => {
    const tx = await buildUnsignedTx(sendTxJson);
    const encoded = codec.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
    done();
  });

  it("encodes signed transaction", async done => {
    const tx = await buildSignedTx(signedTxJson);
    const encoded = codec.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(signedTxBin);
    done();
  });
});

describe("Ensure crypto", () => {
  it("private key and public key match", async done => {
    const privKey = privJson.data;
    const pubKey = pubJson.data;
    const msg = Uint8Array.from([12, 54, 98, 243, 11]);
    const signature = await Ed25519.createSignature(msg, privKey);
    const value = await Ed25519.verifySignature(signature, msg, pubKey);
    expect(value).toBeTruthy();
    done();
  });

  it("sign bytes match", async done => {
    const privKey = privJson.data;
    const pubKey = pubJson.data;

    const tx = await buildUnsignedTx(sendTxJson);
    const encoded = codec.app.Tx.encode(tx).finish();
    const toSign = appendSignBytes(encoded, sendTxJson.chainId, sig.nonce);
    expect(toSign).toEqual(signBytes);

    // make sure we can validate this signature (our signBytes are correct)
    const signature = sig.signature;
    const valid = await Ed25519.verifySignature(signature, toSign, pubKey);
    expect(valid).toBeTruthy();

    // make sure we can generate a compatible signature
    const mySig = await Ed25519.createSignature(toSign, privKey);
    expect(mySig).toEqual(signature);
    done();
  });
});
