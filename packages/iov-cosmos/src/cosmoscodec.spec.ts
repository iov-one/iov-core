import { PostableBytes } from "@iov/bcp";

import { cosmosCodec } from "./cosmoscodec";
import { chainId, signedTxBin, signedTxJson, txId } from "./testdata.spec";

describe("cosmoscodec", () => {
  it("properly encodes transactions", () => {
    const encoded = cosmosCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });

  it("properly decodes transactions", () => {
    const decoded = cosmosCodec.parseBytes(signedTxBin as PostableBytes, chainId);
    expect(decoded).toEqual(signedTxJson);
  });

  it("generates transaction id", () => {
    const id = cosmosCodec.identifier(signedTxJson);
    expect(id).toMatch(/^[0-9A-F]{64}$/);
    expect(id).toEqual(txId);
  });

  it("round trip works", () => {
    const encoded = cosmosCodec.bytesToPost(signedTxJson);
    const decoded = cosmosCodec.parseBytes(encoded, chainId);
    expect(decoded).toEqual(signedTxJson);
  });
});
