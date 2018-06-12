import * as codec from "../src/codec";
import { encodePubKey } from "../src/types";

import { fromHex, pubBin, pubJSON, toHex } from "./testdata";

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
    expect(Uint8Array.from(encoded)).toEqual(pubBin);
  });
});
