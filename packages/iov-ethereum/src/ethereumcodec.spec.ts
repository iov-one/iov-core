import {
  Address,
  Algorithm,
  ChainId,
  Nonce,
  PostableBytes,
  PublicKeyBytes,
  SignatureBytes,
  TokenTicker,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { ethereumCodec } from "./ethereumcodec";

const { fromHex } = Encoding;

describe("ethereumCodec", () => {
  describe("parseBytes", () => {
    it("works", () => {
      const rawGetTransactionByHashResult = {
        blockHash: "0x05ebd1bd99956537f49cfa1104682b3b3f9ff9249fa41a09931ce93368606c21",
        blockNumber: "0x37ef3e",
        from: "0x0a65766695a712af41b5cfecaad217b1a11cb22a",
        gas: "0x226c8",
        gasPrice: "0x3b9aca00",
        hash: "0x3b87faa3410f33284124a6898fac1001673f0f7c3682d18f55bdff0031cce9ce",
        input: "0x536561726368207478207465737420302e36353930383639313733393634333335",
        nonce: "0xe1",
        r: "0xb9299dab50b3cddcaecd64b29bfbd5cd30fac1a1adea1b359a13c4e5171492a6",
        s: "0x573059c66d894684488f92e7ce1f91b158ca57b0235485625b576a3b98c480ac",
        to: "0xe137f5264b6b528244e1643a2d570b37660b7f14",
        transactionIndex: "0xb",
        v: "0x2b",
        value: "0x53177c",
      };
      const expectedPubkey = fromHex(
        "041d4c015b00cbd914e280b871d3c6ae2a047ca650d3ecea4b5246bb3036d4d74960b7feb09068164d2b82f1c7df9e95839b29ae38e90d60578b2318a54e108cf8",
      ) as PublicKeyBytes;

      const postableBytes = Encoding.toUtf8(
        JSON.stringify({ ...rawGetTransactionByHashResult, type: 0 }),
      ) as PostableBytes;
      expect(ethereumCodec.parseBytes(postableBytes, "ethereum-eip155-4" as ChainId)).toEqual({
        transaction: {
          kind: "bcp/send",
          creator: {
            chainId: "ethereum-eip155-4" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: expectedPubkey,
            },
          },
          fee: {
            // TODO: Make this make sense
            tokens: {
              quantity: "141000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          amount: {
            quantity: "5445500",
            fractionalDigits: 18,
            tokenTicker: "ETH" as TokenTicker,
          },
          recipient: "0xE137f5264b6B528244E1643a2D570b37660B7F14" as Address,
          memo: "Search tx test 0.6590869173964335",
        },
        primarySignature: {
          nonce: 225 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("b9299dab50b3cddcaecd64b29bfbd5cd30fac1a1adea1b359a13c4e5171492a6"),
            Encoding.fromHex("573059c66d894684488f92e7ce1f91b158ca57b0235485625b576a3b98c480ac"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });
  });
});
