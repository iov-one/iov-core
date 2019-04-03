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

import { constants } from "./constants";
import { Erc20Options } from "./erc20";
import { EthereumCodec, ethereumCodec, EthereumRpcTransactionResult } from "./ethereumcodec";

const { fromHex } = Encoding;

describe("ethereumCodec", () => {
  describe("parseBytes", () => {
    it("works", () => {
      // curl -sS -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x3b87faa3410f33284124a6898fac1001673f0f7c3682d18f55bdff0031cce9ce"],"id":1}' https://rinkeby.infura.io | jq .result
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

      const erc20Tokens = new Map<TokenTicker, Erc20Options>([
        [
          "WETH" as TokenTicker,
          {
            contractAddress: "0xc778417e063141139fce010982780140aa0cd5ab" as Address,
            decimals: 18,
            symbol: "WETH" as TokenTicker,
          },
        ],
      ]);
      const codec = new EthereumCodec({ erc20Tokens: erc20Tokens });
      expect(codec.parseBytes(postableBytes, "ethereum-eip155-4" as ChainId)).toEqual({
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
            tokenTicker: "WETH" as TokenTicker,
          },
          recipient: "0x9ea4094Ed5D7E089ac846C7D66fc518bd24753ab" as Address,
          memo: undefined,
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

    it("interprets ERC20 transfer of unknown contract as ETH send", () => {
      // There is only one transaction type on Ethereum. Smart contract interaction and
      // ETH sends can only reliably be differentiated when all contract addresses are known.
      // As a result, we interprete all unknown transactions as ETH send.

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

      const codec = new EthereumCodec({ erc20Tokens: new Map<TokenTicker, Erc20Options>() });
      expect(codec.parseBytes(postableBytes, "ethereum-eip155-4" as ChainId)).toEqual({
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
            quantity: "0",
            fractionalDigits: 18,
            tokenTicker: "ETH" as TokenTicker,
          },
          recipient: "0xc778417E063141139Fce010982780140Aa0cD5Ab" as Address,
          // Non-UTF8 automatically represented as hex
          memo:
            "a9059cbb00000000 0000000000000000 9ea4094ed5d7e089 ac846c7d66fc518b d24753ab00000000 0000000000000000 0000000000000000 0000000000000000 00000002",
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

    it("works for Ether atomic swap offer", () => {
      // Retrieved from local instance since we haven't deployed this to a public testnet
      // curl - sS - X POST--data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x044870acdb5fdab0f76266eda11cdeee50de880f58ccf6bfb32a6b651914f637"],"id":1}' http://localhost:8545 | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        hash: "0x044870acdb5fdab0f76266eda11cdeee50de880f58ccf6bfb32a6b651914f637",
        nonce: "0x36",
        blockHash: "0x5fabed71b3d99dec733a8d513c1e91971d8446baeb044d00d609937148712929",
        blockNumber: "0x37",
        transactionIndex: "0x0",
        from: "0x88f3b5659075d0e06bb1004be7b1a7e66f452284",
        to: "0xe1c9ea25a621cf5c934a7e112ecab640ec7d8d18",
        value: "0x1ca3660340",
        gas: "0x200b20",
        gasPrice: "0x4a817c800",
        input:
          "0x0eed85485cecbb0814d20c1f6221fdec0c2902172182d1b2f3212957f947e4cea398ebe6000000000000000000000000901a84da2b9c5cbb64d8aeeca58d5fd0339bb018015d55677261fb5deb1e94dac1ffb6dc0de51eb3b6c0631f7f9f2e4f41eca085000000000000000000000000000000000000000000000000000000000000003b",
        v: "0x2d45",
        r: "0x9351a7fa42078636bd36bbae0d8d5f009b92986991bcc92ae882bce8982360d5",
        s: "0x706a6f90bb42b9d929150839fb9aa06207e40f8d814183e30789ac036263497f",
      };
      const expectedPubkey = fromHex(
        "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
      ) as PublicKeyBytes;
      const expectedSwapId = fromHex("5cecbb0814d20c1f6221fdec0c2902172182d1b2f3212957f947e4cea398ebe6");
      const expectedRecipient = "0x901A84DA2b9c5CBb64D8AEECa58D5FD0339bB018";
      const expectedHash = fromHex("015d55677261fb5deb1e94dac1ffb6dc0de51eb3b6c0631f7f9f2e4f41eca085");

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;

      expect(ethereumCodec.parseBytes(postableBytes, "ethereum-eip155-5777" as ChainId)).toEqual({
        transaction: {
          kind: "bcp/swap_offer",
          creator: {
            chainId: "ethereum-eip155-5777" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: expectedPubkey,
            },
          },
          fee: {
            gasLimit: {
              quantity: "2100000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
            gasPrice: {
              quantity: "20000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          amounts: [
            {
              quantity: "123000456000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          ],
          swapId: expectedSwapId,
          recipient: expectedRecipient,
          hash: expectedHash,
          timeout: {
            height: 59,
          },
          contractAddress: constants.atomicSwapEtherContractAddress,
        },
        primarySignature: {
          nonce: 54 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("9351a7fa42078636bd36bbae0d8d5f009b92986991bcc92ae882bce8982360d5"),
            Encoding.fromHex("706a6f90bb42b9d929150839fb9aa06207e40f8d814183e30789ac036263497f"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });
  });
});
