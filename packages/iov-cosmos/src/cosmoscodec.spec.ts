import { PostableBytes, PrehashType } from "@iov/bcp";
import { Encoding } from "@iov/encoding";

import { cosmosCodec } from "./cosmoscodec";
import { chainId, nonce, sendTxJson, signedTxBin, signedTxJson, txId } from "./testdata.spec";

const { toUtf8 } = Encoding;

describe("cosmoscodec", () => {
  it("properly generates bytes to sign", () => {
    const expected = {
      bytes: toUtf8(
        '{"account_number":"0","chain_id":"cosmoshub-2","fee":{"amount":[{"amount":"5000","denom":"uatom"}],"gas":"200000"},"memo":"1122672754","msgs":[{"type":"cosmos-sdk/MsgSend","value":{"amount":[{"amount":"11657995","denom":"uatom"}],"from_address":"cosmos1h806c7khnvmjlywdrkdgk2vrayy2mmvf9rxk2r","to_address":"cosmos1z7g5w84ynmjyg0kqpahdjqpj7yq34v3suckp0e"}}],"sequence":"99"}',
      ),
      prehashType: PrehashType.Sha256,
    };
    const bytesToSign = cosmosCodec.bytesToSign(sendTxJson, nonce);

    expect(bytesToSign).toEqual(expected);
  });

  it("properly encodes transactions", () => {
    const encoded = cosmosCodec.bytesToPost(signedTxJson);
    expect(encoded).toEqual(signedTxBin);
  });

  it("throws when trying to decode a transaction without a nonce", () => {
    expect(() => cosmosCodec.parseBytes(signedTxBin as PostableBytes, chainId)).toThrowError(
      /nonce is required/i,
    );
  });

  it("properly decodes transactions", () => {
    const decoded = cosmosCodec.parseBytes(signedTxBin as PostableBytes, chainId, nonce);
    expect(decoded).toEqual(signedTxJson);
  });

  it("generates transaction id", () => {
    const id = cosmosCodec.identifier(signedTxJson);
    expect(id).toMatch(/^[0-9A-F]{64}$/);
    expect(id).toEqual(txId);
  });

  it("round trip works", () => {
    const encoded = cosmosCodec.bytesToPost(signedTxJson);
    const decoded = cosmosCodec.parseBytes(encoded, chainId, nonce);
    expect(decoded).toEqual(signedTxJson);
  });
});
