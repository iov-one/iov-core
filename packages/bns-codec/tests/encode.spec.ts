import { Encoding } from "@iov/crypto";

import * as codec from "../src/codec";
import { buildMsg, buildTx } from "../src/encode";
import { encodePubKey, encodeToken } from "../src/types";
import { keyToAddress } from "../src/util";

import {
  address,
  coinBin,
  coinJSON,
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
