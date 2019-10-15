import { cosmosCodec } from "./cosmoscodec";
import { signedTxBin, signedTxJson } from "./testdata.spec";

describe("cosmoscodec", () => {
  it("properly encodes transactions", () => {
    const encoded = cosmosCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });
});
