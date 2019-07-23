import {
  Address,
  Algorithm,
  ChainId,
  Hash,
  Nonce,
  PostableBytes,
  Preimage,
  PubkeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapId,
  SwapIdBytes,
  SwapOfferTransaction,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { ExtendedSecp256k1Signature } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import { Erc20ApproveTransaction, Erc20Options } from "./erc20";
import { EthereumCodec, EthereumRpcTransactionResult } from "./ethereumcodec";
import { SwapIdPrefix } from "./serialization";
import { testConfig } from "./testconfig.spec";

const { fromHex } = Encoding;

const ethereumCodec = new EthereumCodec({
  atomicSwapEtherContractAddress: testConfig.connectionOptions.atomicSwapEtherContractAddress,
  atomicSwapErc20ContractAddress: testConfig.connectionOptions.atomicSwapErc20ContractAddress,
});

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
      ) as PubkeyBytes;

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;
      const parsed = ethereumCodec.parseBytes(postableBytes, "ethereum-eip155-4" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SendTransaction & WithCreator>).toEqual({
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
            gasLimit: "141000",
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
          sender: "0x0A65766695A712Af41B5cfECAaD217B1a11CB22A" as Address,
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
      ) as PubkeyBytes;

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
      const parsed = codec.parseBytes(postableBytes, "ethereum-eip155-4" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SendTransaction & WithCreator>).toEqual({
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
            gasLimit: "141000",
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
          sender: "0x9bD26664827550982960b9E76bcd88C0b6791bb4" as Address,
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
      // As a result, we interpret all unknown transactions as ETH send.

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
      ) as PubkeyBytes;

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;

      const codec = new EthereumCodec({ erc20Tokens: new Map<TokenTicker, Erc20Options>() });
      const parsed = codec.parseBytes(postableBytes, "ethereum-eip155-4" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SendTransaction & WithCreator>).toEqual({
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
            gasLimit: "141000",
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
          sender: "0x9bD26664827550982960b9E76bcd88C0b6791bb4" as Address,
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

    it("works for ERC20 approve", () => {
      // curl -sS -X POST --data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x4734349dd36860c9f7c981e2c673f986ade036e2b7b64dcc55f0bf0ce461daae"],"id":1}' https://mainnet.infura.io | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        blockHash: "0x6181b9dd9b4237a4a0228accd86d9c989882187bc66f57070a725f61298e3860",
        blockNumber: "0x7482d5",
        from: "0xbdfd9e1fa05c6ad0714e6f27bdb4b821ec99f7a2",
        gas: "0x186a0",
        gasPrice: "0xa7a358200",
        hash: "0x4734349dd36860c9f7c981e2c673f986ade036e2b7b64dcc55f0bf0ce461daae",
        input:
          "0x095ea7b30000000000000000000000004b525ae3a20021639d6e00bf752e6d2b7f65196effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        nonce: "0x0",
        r: "0x194013d2767d86e0aac07f5e713e52c1bafdbe20361b59257ae7e5665d504bf1",
        s: "0x76deb0b778442ff69b61fa9c27333e4b2e6c184643b1ce3d60b4da2cb39266c3",
        to: "0x1985365e9f78359a9b6ad760e32412f4a445e862",
        transactionIndex: "0x33",
        v: "0x25",
        value: "0x0",
      };
      const expectedPubkey = fromHex(
        "043e82ebc5dd773720677229f4eedcb61dbb131533ce0a4206e3788a92b70224505ef120ca98418d3657c891d0cd74cb15dca10f94a3ffd7a7f65bc99e1138b5c2",
      ) as PubkeyBytes;

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;

      const erc20Tokens = new Map<TokenTicker, Erc20Options>([
        [
          "REP" as TokenTicker,
          {
            contractAddress: "0x1985365e9f78359a9b6ad760e32412f4a445e862" as Address,
            decimals: 18,
            symbol: "REP" as TokenTicker,
          },
        ],
      ]);
      const codec = new EthereumCodec({ erc20Tokens: erc20Tokens });
      const parsed = codec.parseBytes(postableBytes, "ethereum-eip155-1" as ChainId);
      expect((parsed as unknown) as SignedTransaction<Erc20ApproveTransaction & WithCreator>).toEqual({
        transaction: {
          kind: "erc20/approve",
          creator: {
            chainId: "ethereum-eip155-1" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: expectedPubkey,
            },
          },
          fee: {
            gasLimit: "100000",
            gasPrice: {
              quantity: "45000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          amount: {
            quantity: "115792089237316195423570985008687907853269984665640564039457584007913129639935",
            fractionalDigits: 18,
            tokenTicker: "REP" as TokenTicker,
          },
          spender: "0x4b525aE3A20021639D6e00bf752E6d2B7F65196e" as Address,
        },
        primarySignature: {
          nonce: 0 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("194013d2767d86e0aac07f5e713e52c1bafdbe20361b59257ae7e5665d504bf1"),
            Encoding.fromHex("76deb0b778442ff69b61fa9c27333e4b2e6c184643b1ce3d60b4da2cb39266c3"),
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
        // lowercase value of testConfig.connectionOptions.atomicSwapEtherContractAddress
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
      ) as PubkeyBytes;
      const expectedSwapId: SwapId = {
        prefix: SwapIdPrefix.Ether,
        data: fromHex("5cecbb0814d20c1f6221fdec0c2902172182d1b2f3212957f947e4cea398ebe6") as SwapIdBytes,
      };
      const expectedRecipient = "0x901A84DA2b9c5CBb64D8AEECa58D5FD0339bB018" as Address;
      const expectedHash = fromHex(
        "015d55677261fb5deb1e94dac1ffb6dc0de51eb3b6c0631f7f9f2e4f41eca085",
      ) as Hash;

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;

      const parsed = ethereumCodec.parseBytes(postableBytes, "ethereum-eip155-5777" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SwapOfferTransaction & WithCreator>).toEqual({
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
            gasLimit: "2100000",
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

    it("works for Ether atomic swap claim", async () => {
      // Retrieved from local instance since we haven't deployed this to a public testnet
      // curl - sS - X POST--data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x85bbdfabbf38e6888488f7e967a5b7784bc8041416773ecdfc2b57e365bc3777"],"id":1}' http://localhost:8545 | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        hash: "0x85bbdfabbf38e6888488f7e967a5b7784bc8041416773ecdfc2b57e365bc3777",
        nonce: "0x7e",
        blockHash: "0x3e89a5ab1eff099d952cc0a942c12f8802ba1ff5ed2e97b2711a5a94866f8ed6",
        blockNumber: "0x7f",
        transactionIndex: "0x0",
        from: "0x88f3b5659075d0e06bb1004be7b1a7e66f452284",
        to: "0xe1c9ea25a621cf5c934a7e112ecab640ec7d8d18",
        value: "0x0",
        gas: "0x200b20",
        gasPrice: "0x4a817c800",
        input:
          "0x84cc9dfb069446e5b7469d5301212de56f17a8786bee70d9bf4c072e99fcfb2c4d9f5242c863ca8b63351354c4dafbf585a28095bf9ef5c6719fd7eacc7a1ce0ad27a298",
        v: "0x2d46",
        r: "0xde9a75921207a5df2757d76408436e38f2186a0047e2955f884f0672c805282c",
        s: "0x259c0f7c9a1383ef35fa5f41996dfb38744f9df6fe027a2e107d0b6d40ab1ae6",
      };
      const expectedPubkey = fromHex(
        "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
      ) as PubkeyBytes;
      const expectedSwapId: SwapId = {
        prefix: SwapIdPrefix.Ether,
        data: fromHex("069446e5b7469d5301212de56f17a8786bee70d9bf4c072e99fcfb2c4d9f5242") as SwapIdBytes,
      };
      const expectedPreimage = fromHex(
        "c863ca8b63351354c4dafbf585a28095bf9ef5c6719fd7eacc7a1ce0ad27a298",
      ) as Preimage;

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;

      const parsed = ethereumCodec.parseBytes(postableBytes, "ethereum-eip155-5777" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SwapClaimTransaction & WithCreator>).toEqual({
        transaction: {
          kind: "bcp/swap_claim",
          creator: {
            chainId: "ethereum-eip155-5777" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: expectedPubkey,
            },
          },
          fee: {
            gasLimit: "2100000",
            gasPrice: {
              quantity: "20000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          swapId: expectedSwapId,
          preimage: expectedPreimage,
        },
        primarySignature: {
          nonce: 126 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("de9a75921207a5df2757d76408436e38f2186a0047e2955f884f0672c805282c"),
            Encoding.fromHex("259c0f7c9a1383ef35fa5f41996dfb38744f9df6fe027a2e107d0b6d40ab1ae6"),
            1,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });

    it("works for Ether atomic swap abort", async () => {
      // Retrieved from local instance since we haven't deployed this to a public testnet
      // curl - sS - X POST--data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0xb8a6bdbcc56f30e385e928fee46374bceec1c6887814c0b4bddb23c8df25d91b"],"id":1}' http://localhost:8545 | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        hash: "0xb8a6bdbcc56f30e385e928fee46374bceec1c6887814c0b4bddb23c8df25d91b",
        nonce: "0xa0",
        blockHash: "0x06d53572b61a054d12afab59fde70cbde3cbd9385e5a4fc07dadcf0c87abd414",
        blockNumber: "0xa1",
        transactionIndex: "0x0",
        from: "0x88f3b5659075d0e06bb1004be7b1a7e66f452284",
        to: "0xe1c9ea25a621cf5c934a7e112ecab640ec7d8d18",
        value: "0x0",
        gas: "0x200b20",
        gasPrice: "0x4a817c800",
        input: "0x09d6ce0ea7679de779f2df7fde7617a9cdd013c8dbf5701aa158173d9c615766a212d243",
        v: "0x2d45",
        r: "0x3449246d974d28fffae32af389ef7271c18ff6e6766ce6f54f6243764e6877d6",
        s: "0x7e2280164650d4fc0c4a2fd1edfeedb70e7c8453117f9cbd6a644abd5e1ddf9b",
      };
      const expectedPubkey = fromHex(
        "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
      ) as PubkeyBytes;
      const expectedSwapId: SwapId = {
        prefix: SwapIdPrefix.Ether,
        data: fromHex("a7679de779f2df7fde7617a9cdd013c8dbf5701aa158173d9c615766a212d243") as SwapIdBytes,
      };

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;

      const parsed = ethereumCodec.parseBytes(postableBytes, "ethereum-eip155-5777" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SwapAbortTransaction & WithCreator>).toEqual({
        transaction: {
          kind: "bcp/swap_abort",
          creator: {
            chainId: "ethereum-eip155-5777" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: expectedPubkey,
            },
          },
          fee: {
            gasLimit: "2100000",
            gasPrice: {
              quantity: "20000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          swapId: expectedSwapId,
        },
        primarySignature: {
          nonce: 160 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("3449246d974d28fffae32af389ef7271c18ff6e6766ce6f54f6243764e6877d6"),
            Encoding.fromHex("7e2280164650d4fc0c4a2fd1edfeedb70e7c8453117f9cbd6a644abd5e1ddf9b"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });

    it("works for Erc20 atomic swap offer", () => {
      // Retrieved from local instance since we haven't deployed this to a public testnet
      // curl - sS - X POST--data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x293419b275bfdab614697c2dabe85cf9f47ad8d728675d622d65e0839992afc2"],"id":1}' http://localhost:8545 | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        hash: "0x293419b275bfdab614697c2dabe85cf9f47ad8d728675d622d65e0839992afc2",
        nonce: "0xf5",
        blockHash: "0x9b87730ec2ff05f8017a7226f21eba47bc680e2edec681474efbbe4878602067",
        blockNumber: "0x10e",
        transactionIndex: "0x0",
        from: "0x88f3b5659075d0e06bb1004be7b1a7e66f452284",
        to: "0x9768ae2339b48643d710b11ddbdb8a7edbea15bc",
        value: "0x0",
        gas: "0x200b20",
        gasPrice: "0x4a817c800",
        input:
          "0xe8d8a293c42b0efc99bb1726bb429b5a4ccf7b4b236c54027eb15cd5c24761f8adf8def30000000000000000000000009c212466a863c2635a31c41f6384818816869a0fc7c270042ff9d49b3283da3b12adb1711608096f3774bbb1fabf7727d9b1b0a20000000000000000000000000000000000000000000000000000000000000111000000000000000000000000cb642a87923580b6f7d07d1471f93361196f2650000000000000000000000000000000000000000000000000000000000001e078",
        v: "0x2d46",
        r: "0x26a7e609ce83e01b8e754641fbd9315f5a558c7b279d1bbe186d8be786c6fb18",
        s: "0x02555167f9584575f9740c0487dcdd2e1462a8374dd9dcc9e66cfa98eb1efd87",
      };
      const expectedPubkey = fromHex(
        "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
      ) as PubkeyBytes;
      const expectedSwapId: SwapId = {
        prefix: SwapIdPrefix.Erc20,
        data: fromHex("c42b0efc99bb1726bb429b5a4ccf7b4b236c54027eb15cd5c24761f8adf8def3") as SwapIdBytes,
      };
      const expectedRecipient = "0x9c212466A863C2635A31c41f6384818816869a0F" as Address;
      const expectedHash = fromHex(
        "c7c270042ff9d49b3283da3b12adb1711608096f3774bbb1fabf7727d9b1b0a2",
      ) as Hash;

      const erc20Tokens = new Map<TokenTicker, Erc20Options>([
        [
          "ASH" as TokenTicker,
          {
            contractAddress: "0xCb642A87923580b6F7D07D1471F93361196f2650" as Address,
            decimals: 12,
            symbol: "ASH" as TokenTicker,
          },
        ],
      ]);
      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;
      const codec = new EthereumCodec({
        atomicSwapErc20ContractAddress: testConfig.connectionOptions.atomicSwapErc20ContractAddress,
        erc20Tokens: erc20Tokens,
      });

      const parsed = codec.parseBytes(postableBytes, "ethereum-eip155-5777" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SwapOfferTransaction & WithCreator>).toEqual({
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
            gasLimit: "2100000",
            gasPrice: {
              quantity: "20000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          amounts: [
            {
              quantity: "123000",
              fractionalDigits: 12,
              tokenTicker: "ASH" as TokenTicker,
            },
          ],
          swapId: expectedSwapId,
          recipient: expectedRecipient,
          hash: expectedHash,
          timeout: {
            height: 273,
          },
        },
        primarySignature: {
          nonce: 245 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("26a7e609ce83e01b8e754641fbd9315f5a558c7b279d1bbe186d8be786c6fb18"),
            Encoding.fromHex("02555167f9584575f9740c0487dcdd2e1462a8374dd9dcc9e66cfa98eb1efd87"),
            1,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });

    it("works for Erc20 atomic swap claim", async () => {
      // Retrieved from local instance since we haven't deployed this to a public testnet
      // curl - sS - X POST--data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0xa7a4ed452ee5861aaa20837a4fdf077b8ab28a2c08a228b6eb64268b8ee35764"],"id":1}' http://localhost:8545 | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        hash: "0xa7a4ed452ee5861aaa20837a4fdf077b8ab28a2c08a228b6eb64268b8ee35764",
        nonce: "0x133",
        blockHash: "0x468c58013ef907cd84c40484e35a183f28b48469ff38f6e8c761d42e07c85a0c",
        blockNumber: "0x150",
        transactionIndex: "0x0",
        from: "0x88f3b5659075d0e06bb1004be7b1a7e66f452284",
        to: "0x9768ae2339b48643d710b11ddbdb8a7edbea15bc",
        value: "0x0",
        gas: "0x200b20",
        gasPrice: "0x4a817c800",
        input:
          "0x84cc9dfb94d53ea2d55dc86e65e44fcb473fb58dbbc00eab27f414d1b280af26222a995c2d5620657269304e87faf497880c77f5a4f7bb7b3eff66da70a83408549c219f",
        v: "0x2d45",
        r: "0x388baff61d88ff954b40e8980c42a50633d08f954a3b281513ffbd1759fa902e",
        s: "0x578e59f1cfba37881d4851d0cb96eee287436fbe4a3a9ea4f6407c064f1e4f03",
      };
      const expectedPubkey = fromHex(
        "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
      ) as PubkeyBytes;
      const expectedSwapId: SwapId = {
        prefix: SwapIdPrefix.Erc20,
        data: fromHex("94d53ea2d55dc86e65e44fcb473fb58dbbc00eab27f414d1b280af26222a995c") as SwapIdBytes,
      };
      const expectedPreimage = fromHex(
        "2d5620657269304e87faf497880c77f5a4f7bb7b3eff66da70a83408549c219f",
      ) as Preimage;
      const erc20Tokens = new Map<TokenTicker, Erc20Options>([
        [
          "ASH" as TokenTicker,
          {
            contractAddress: "0xCb642A87923580b6F7D07D1471F93361196f2650" as Address,
            decimals: 12,
            symbol: "ASH" as TokenTicker,
          },
        ],
      ]);

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;
      const codec = new EthereumCodec({
        atomicSwapErc20ContractAddress: testConfig.connectionOptions.atomicSwapErc20ContractAddress,
        erc20Tokens: erc20Tokens,
      });

      const parsed = codec.parseBytes(postableBytes, "ethereum-eip155-5777" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SwapClaimTransaction & WithCreator>).toEqual({
        transaction: {
          kind: "bcp/swap_claim",
          creator: {
            chainId: "ethereum-eip155-5777" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: expectedPubkey,
            },
          },
          fee: {
            gasLimit: "2100000",
            gasPrice: {
              quantity: "20000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          swapId: expectedSwapId,
          preimage: expectedPreimage,
        },
        primarySignature: {
          nonce: 307 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("388baff61d88ff954b40e8980c42a50633d08f954a3b281513ffbd1759fa902e"),
            Encoding.fromHex("578e59f1cfba37881d4851d0cb96eee287436fbe4a3a9ea4f6407c064f1e4f03"),
            0,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });

    it("works for Erc20 atomic swap abort", async () => {
      // Retrieved from local instance since we haven't deployed this to a public testnet
      // curl - sS - X POST--data '{"jsonrpc":"2.0","method":"eth_getTransactionByHash","params":["0x224c51c8641da40fec0987972af1f6e7bf4635a2eb7366be68da1bfcea144814"],"id":1}' http://localhost:8545 | jq .result
      const rawGetTransactionByHashResult: EthereumRpcTransactionResult = {
        hash: "0x224c51c8641da40fec0987972af1f6e7bf4635a2eb7366be68da1bfcea144814",
        nonce: "0x15b",
        blockHash: "0x66b46bae1c7023c2c3c98228fabd317b096ad5a0d542677d4c3cf3f739bdddc5",
        blockNumber: "0x178",
        transactionIndex: "0x0",
        from: "0x88f3b5659075d0e06bb1004be7b1a7e66f452284",
        to: "0x9768ae2339b48643d710b11ddbdb8a7edbea15bc",
        value: "0x0",
        gas: "0x200b20",
        gasPrice: "0x4a817c800",
        input: "0x09d6ce0e144c07a765cd2435882edbc334218b1678b2c5773284bf715ba766f97ee4f2fd",
        v: "0x2d46",
        r: "0x367e3b3f8253f2f0f4404754b139d93362973de949ccdd5f0dc5a342f8cd2131",
        s: "0x0f80b13350349f083f44dd507a7ae7bc783389a7b4c18853d073e0e8c59c6ce0",
      };
      const expectedPubkey = fromHex(
        "04965fb72aad79318cd8c8c975cf18fa8bcac0c091605d10e89cd5a9f7cff564b0cb0459a7c22903119f7a42947c32c1cc6a434a86f0e26aad00ca2b2aff6ba381",
      ) as PubkeyBytes;
      const expectedSwapId: SwapId = {
        prefix: SwapIdPrefix.Erc20,
        data: fromHex("144c07a765cd2435882edbc334218b1678b2c5773284bf715ba766f97ee4f2fd") as SwapIdBytes,
      };

      const postableBytes = Encoding.toUtf8(JSON.stringify(rawGetTransactionByHashResult)) as PostableBytes;

      const parsed = ethereumCodec.parseBytes(postableBytes, "ethereum-eip155-5777" as ChainId);
      expect((parsed as unknown) as SignedTransaction<SwapAbortTransaction & WithCreator>).toEqual({
        transaction: {
          kind: "bcp/swap_abort",
          creator: {
            chainId: "ethereum-eip155-5777" as ChainId,
            pubkey: {
              algo: Algorithm.Secp256k1,
              data: expectedPubkey,
            },
          },
          fee: {
            gasLimit: "2100000",
            gasPrice: {
              quantity: "20000000000",
              fractionalDigits: 18,
              tokenTicker: "ETH" as TokenTicker,
            },
          },
          swapId: expectedSwapId,
        },
        primarySignature: {
          nonce: 347 as Nonce,
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: expectedPubkey,
          },
          signature: new ExtendedSecp256k1Signature(
            Encoding.fromHex("367e3b3f8253f2f0f4404754b139d93362973de949ccdd5f0dc5a342f8cd2131"),
            Encoding.fromHex("0f80b13350349f083f44dd507a7ae7bc783389a7b4c18853d073e0e8c59c6ce0"),
            1,
          ).toFixedLength() as SignatureBytes,
        },
        otherSignatures: [],
      });
    });
  });
});
