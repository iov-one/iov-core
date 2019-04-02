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

import { ethereumCodec, EthereumRpcTransactionResult } from "./ethereumcodec";

const { fromHex } = Encoding;

describe("ethereumCodec", () => {
  describe("parseBytes", () => {
    it("works", () => {
      // curl -sS -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x3b87faa3410f33284124a6898fac1001673f0f7c3682d18f55bdff0031cce9ce"],"id":1}' https://rinkeby.infura.io | jq
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
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

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;
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
            gasLimit: {
              quantity: "141000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
            gasPrice: {
              quantity: "1000000000",
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

    it("works for ERC20 transfer", () => {
      // curl -sS -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x80295fc8cdf6ac5fce39f34037f07d5be3abe82baa8468196faf1f00ced239e3"],"id":1}' https://rinkeby.infura.io | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        blockHash: "0x135592131306762eef45d8f12c3d27c5d709c84d124f0df062d0bb3806a32701",
        blockNumber: "0x3f20f6",
        from: "0x9bd26664827550982960b9e76bcd88c0b6791bb4",
        gas: "0x226c8",
        gasPrice: "0x3b9aca00",
        hash: "0x80295fc8cdf6ac5fce39f34037f07d5be3abe82baa8468196faf1f00ced239e3",
        input:
          "0xa9059cbb0000000000000000000000009ea4094ed5d7e089ac846c7d66fc518bd24753ab0000000000000000000000000000000000000000000000000000000000000002",
        nonce: "0x1",
        r: "0xcbe96b38321e6ef536da5e74b558cf87acdda825be35be40627b2b3d8633b8f4",
        s: "0x7fc31ca5bb3dbd02e5e8fc5093082f3f2ab3e0042d4e5b25fe09e5f7485d83b7",
        to: "0xc778417e063141139fce010982780140aa0cd5ab",
        transactionIndex: "0x7",
        v: "0x2b",
        value: "0x0",
      };
      const expectedPubkey = fromHex(
        "040b8b6f82e7226d21991dd6b1a7de357cebfc42ccb95678404d8e2b54cc3be187b17a50ef833884df318aa7def070585c92a185272b8cb8b61ba916d993435c87",
      ) as PublicKeyBytes;

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;
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
            gasLimit: {
              quantity: "141000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
            gasPrice: {
              quantity: "1000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          amount: {
            quantity: "2",
            fractionalDigits: 18,
            tokenTicker: "TKN" as TokenTicker,
          },
          recipient: "0x9ea4094Ed5D7E089ac846C7D66fc518bd24753ab" as Address,
          memo: undefined,
          contractAddress: "0xc778417E063141139Fce010982780140Aa0cD5Ab" as Address,
        },
        primarySignature: {
          nonce: 1 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("cbe96b38321e6ef536da5e74b558cf87acdda825be35be40627b2b3d8633b8f4"),
            Encoding.fromHex("7fc31ca5bb3dbd02e5e8fc5093082f3f2ab3e0042d4e5b25fe09e5f7485d83b7"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });
  });
});
