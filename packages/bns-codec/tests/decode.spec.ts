import * as codec from "../src/codec";
import { parseTx } from "../src/decode";
import { decodePrivKey, decodePubKey, decodeToken } from "../src/types";

import {
  chainId,
  coinBin,
  coinJson,
  privBin,
  privJson,
  pubBin,
  pubJson,
  sendTxBin,
  sendTxJson,
  signedTxBin,
} from "./testdata";

describe("Decode helpers", () => {
  it("decode pubkey", () => {
    const decoded = codec.crypto.PublicKey.decode(pubBin);
    const pubkey = decodePubKey(decoded);
    expect(pubkey).toEqual(pubJson);
  });

  it("decode privkey", () => {
    const decoded = codec.crypto.PrivateKey.decode(privBin);
    const privkey = decodePrivKey(decoded);
    expect(privkey).toEqual(privJson);
  });

  it("decode coin", () => {
    const decoded = codec.x.Coin.decode(coinBin);
    const token = decodeToken(decoded);
    expect(token).toEqual(coinJson);
  });
});

describe("Decode transactions", () => {
  it("decode invalid transaction fails", () => {
    /* tslint:disable-next-line:no-bitwise */
    const badBin = signedTxBin.map((x: number, i: number) => (i % 5 ? x ^ 0x01 : x));
    try {
      codec.app.Tx.decode(badBin);
    } catch (err) {
      expect(err.toString()).toContain("RangeError");
      return;
    }
    fail("Should throw error");
  });

  // unsigned tx will fail as parsing requires a sig to extract signer
  it("decode unsigned transaction fails", () => {
    const decoded = codec.app.Tx.decode(sendTxBin);
    try {
      parseTx(decoded, chainId);
    } catch (err) {
      expect(err.toString()).toContain("missing first signature");
      return;
    }
    fail("Should throw error");
  });

  it("decode signed transaction", () => {
    const decoded = codec.app.Tx.decode(signedTxBin);
    const tx = parseTx(decoded, chainId);
    expect(tx.transaction).toEqual(sendTxJson);
  });
});
