import { Ed25519, Encoding } from "@iov/crypto";

import * as codec from "../src/codec";
import { buildMsg, buildTx } from "../src/encode";
import { encodePrivKey, encodePubKey, encodeToken } from "../src/types";
import { appendSignBytes, keyToAddress } from "../src/util";

import {
  address,
  coinBin,
  coinJSON,
  privBin,
  privJSON,
  pubBin,
  pubJSON,
  sendTxBin,
  sendTxJSON,
  signedTxBin,
  sigs,
} from "./testdata";

const { fromHex, toHex } = Encoding;

describe("Control", () => {
  it("hex utils work", () => {
    const input = "1234567890abcdef";
    const bin = fromHex(input);
    expect(bin).toBeTruthy();
    expect(bin.length).toEqual(8);
    const decode = toHex(bin);
    expect(decode).toBeTruthy();
    expect(decode).toEqual(input);
  });
});

describe("Encode helpers", () => {
  it("encode pubkey", () => {
    const pubkey: codec.crypto.IPublicKey = encodePubKey(pubJSON);
    const encoded = codec.crypto.PublicKey.encode(pubkey).finish();
    // force result into Uint8Array for tests so it passes
    // if buffer of correct type as well
    expect(encoded.length).toEqual(pubBin.length);
    expect(Uint8Array.from(encoded)).toEqual(pubBin);
  });

  it("create address", async done => {
    const calc = await keyToAddress(pubJSON);
    expect(Uint8Array.from(calc)).toEqual(address);
    done();
  });

  it("encode private key", () => {
    const privkey = encodePrivKey(privJSON);
    const encoded = codec.crypto.PublicKey.encode(privkey).finish();
    expect(Uint8Array.from(encoded)).toEqual(privBin);
  });

  it("encode coin", () => {
    const token = encodeToken(coinJSON);
    const encoded = codec.x.Coin.encode(token).finish();
    expect(Uint8Array.from(encoded)).toEqual(coinBin);
  });
});

describe("Encode transactions", () => {
  it("encodes unsigned message", async done => {
    const tx = await buildMsg(sendTxJSON);
    const encoded = codec.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
    done();
  });

  it("encodes unsigned transaction", async done => {
    const tx = await buildTx(sendTxJSON, []);
    const encoded = codec.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(sendTxBin);
    done();
  });

  it("encodes signed transaction", async done => {
    const tx = await buildTx(sendTxJSON, sigs);
    const encoded = codec.app.Tx.encode(tx).finish();
    expect(Uint8Array.from(encoded)).toEqual(signedTxBin);
    done();
  });
});

describe("Ensure crypto", () => {
  it("private key and public key match", async done => {
    const privKey = privJSON.data;
    const pubKey = pubJSON.data;
    const msg = Uint8Array.from([12, 54, 98, 243, 11]);
    const sig = await Ed25519.createSignature(msg, privKey);
    const value = await Ed25519.verifySignature(sig, msg, pubKey);
    expect(value).toBeTruthy();
    done();
  });

  it("sign bytes match", async done => {
    const privKey = privJSON.data;
    const pubKey = pubJSON.data;

    const tx = await buildTx(sendTxJSON, []);
    const encoded = codec.app.Tx.encode(tx).finish();
    const signBytes = appendSignBytes(encoded, sendTxJSON.chainId, sigs[0].nonce);

    // make sure we can validate this signature (our signBytes are correct)
    const signature = sigs[0].signature;
    const value = await Ed25519.verifySignature(signature, signBytes, pubKey);
    expect(value).toBeTruthy();

    // make sure we can generate a compatible signature
    const mySig = await Ed25519.createSignature(signBytes, privKey);
    expect(Uint8Array.from(mySig)).toEqual(signature);
    done();
  });
});
