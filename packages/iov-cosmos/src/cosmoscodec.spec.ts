import { PostableBytes } from "@iov/bcp";

import { cosmosCodec } from "./cosmoscodec";
import { chainId, signedTxBin, signedTxJson } from "./testdata.spec";

describe("cosmoscodec", () => {
  it("properly encodes transactions", () => {
    const encoded = cosmosCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });

  it("properly decodes transactions", () => {
    const decoded = cosmosCodec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });
});
