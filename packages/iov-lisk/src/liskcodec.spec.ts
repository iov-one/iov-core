import { Encoding } from "@iov/encoding";
import { Algorithm, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";

import { liskCodec } from "./liskcodec";

const { fromHex, toAscii } = Encoding;

describe("liskCodec", () => {
  it("derives addresses properly", () => {
    // https://testnet-explorer.lisk.io/address/6076671634347365051L
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.ED25519,
      data: fromHex("f4852b270f76dc8b49bfa88de5906e81d3b001d23852f0e74ba60cac7180a184") as PublicKeyBytes,
    };
    expect(liskCodec.keyToAddress(pubkey)).toEqual(toAscii("6076671634347365051L"));
  });
});
