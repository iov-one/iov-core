import {
  Account,
  Address,
  Algorithm,
  Amount,
  AtomicSwap,
  AtomicSwapHelpers,
  AtomicSwapQuery,
  BlockHeader,
  BlockInfoFailed,
  BlockInfoSucceeded,
  ChainId,
  ConfirmedTransaction,
  Hash,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isConfirmedTransaction,
  isSendTransaction,
  isSwapOfferTransaction,
  Nonce,
  PostTxResponse,
  Preimage,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapId,
  swapIdEquals,
  SwapOfferTransaction,
  SwapProcessState,
  SwapTimeout,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  TransactionState,
  UnsignedTransaction,
} from "@iov/bcp";
import { Random, Secp256k1 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { HdPaths, Secp256k1HdWallet, UserProfile, WalletId } from "@iov/keycontrol";
import { toListPromise } from "@iov/stream";

import { pubkeyToAddress } from "./address";
import { EthereumCodec } from "./ethereumcodec";
import { EthereumConnection } from "./ethereumconnection";
import { testConfig } from "./testconfig.spec";

const { fromHex } = Encoding;
const ETH = "ETH" as TokenTicker;

const ethereumCodec = new EthereumCodec({
  atomicSwapEtherContractAddress: testConfig.connectionOptions.atomicSwapEtherContractAddress,
  atomicSwapErc20ContractAddress: testConfig.connectionOptions.atomicSwapErc20ContractAddress,
});

function pendingWithoutEthereum(): void {
  if (!process.env.ETHEREUM_ENABLED) {
    return pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
}

function pendingWithoutEthereumScraper(): void {
  if (!process.env.ETHEREUM_SCRAPER) {
    return pending("Set ETHEREUM_SCRAPER to enable out-of-blockchain functionality tests");
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomAddress(): Promise<Address> {
  const keypair = await Secp256k1.makeKeypair(await Random.getBytes(32));
  return pubkeyToAddress({
    algo: Algorithm.Secp256k1,
    data: keypair.pubkey as PublicKeyBytes,
  });
}

function matchId(id: SwapId): (swap: AtomicSwap) => boolean {
  return s => swapIdEquals(id, s.data.id);
}

describe("EthereumConnection", () => {
  const defaultAmount: Amount = {
    quantity: "445500",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  };

  async function userProfileWithFaucet(
    chainId: ChainId,
  ): Promise<{
    readonly profile: UserProfile;
    readonly walletId: WalletId;
    readonly faucet: PublicIdentity;
  }> {
    const profile = new UserProfile();
    const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
    const faucet = await profile.createIdentity(wallet.id, chainId, HdPaths.ethereum(0));
    return { profile: profile, walletId: wallet.id, faucet: faucet };
  }

  async function postTransaction(
    profile: UserProfile,
    sender: PublicIdentity,
    nonce: Nonce,
    recipient: Address,
    connection: EthereumConnection,
  ): Promise<PostTxResponse> {
    const sendTx: SendTransaction = {
      kind: "bcp/send",
      creator: sender,
      recipient: recipient,
      amount: defaultAmount,
      fee: {
        gasPrice: testConfig.gasPrice,
        gasLimit: testConfig.gasLimit,
      },
      memo: `Some text ${Math.random()}`,
    };
    const signedTransaction = await profile.signTransaction(sendTx, ethereumCodec, nonce);
    const resultPost = await connection.postTx(ethereumCodec.bytesToPost(signedTransaction));
    return resultPost;
  }

  describe("createEtherSwapId", () => {
    it("works", async () => {
      const swapId = await EthereumConnection.createEtherSwapId();
      expect(swapId.data.length).toEqual(32);
    });
  });

  describe("createErc20SwapId", () => {
    it("works", async () => {
      const swapId = await EthereumConnection.createErc20SwapId();
      expect(swapId.data.length).toEqual(32);
    });
  });

  it("can be constructed", () => {
    pendingWithoutEthereum();
    const connection = new EthereumConnection(testConfig.base, testConfig.chainId, {});
    expect(connection).toBeTruthy();
    connection.disconnect();
  });

  it("can get chain ID", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
    const chainId = connection.chainId();
    expect(chainId).toEqual(testConfig.chainId);
    connection.disconnect();
  });

  it("can get height", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
    const height = await connection.height();
    expect(height).toBeGreaterThanOrEqual(testConfig.minHeight);
    connection.disconnect();
  });

  describe("getToken", () => {
    it("can get existing ticker", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const token = await connection.getToken("ETH" as TokenTicker);
      expect(token).toEqual({
        tokenTicker: "ETH" as TokenTicker,
        tokenName: "Ether",
        fractionalDigits: 18,
      });
      connection.disconnect();
    });

    it("produces empty result for non-existing ticker", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const token = await connection.getToken("ALX" as TokenTicker);
      expect(token).toBeUndefined();
      connection.disconnect();
    });
  });

  describe("getAllTokens", () => {
    it("can get all tokens", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });
      const tokens = await connection.getAllTokens();
      expect(tokens).toEqual(testConfig.expectedTokens);
      connection.disconnect();
    });
  });

  describe("getAccount", () => {
    it("can get account from address", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });
      const account = await connection.getAccount({ address: testConfig.accountStates.default.address });
      expect(account).toBeDefined();
      expect(account!.address).toEqual(testConfig.accountStates.default.address);
      expect(account!.balance).toEqual(testConfig.accountStates.default.expectedBalance);
      connection.disconnect();
    });

    it("can get account from pubkey", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });
      const account = await connection.getAccount({ pubkey: testConfig.accountStates.default.pubkey });
      expect(account).toBeDefined();
      expect(account!.address).toEqual(testConfig.accountStates.default.address);
      expect(account!.balance.length).toBeGreaterThanOrEqual(1);
      connection.disconnect();
    });

    it("can get account from unused address", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });

      const account = await connection.getAccount({ address: testConfig.accountStates.unused.address });
      expect(account).toBeUndefined();

      connection.disconnect();
    });

    it("can get account from unused pubkey", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });

      const account = await connection.getAccount({ pubkey: testConfig.accountStates.unused.pubkey });
      expect(account).toBeUndefined();

      connection.disconnect();
    });

    it("has balance for account with no ETH but ERC20 tokens", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });

      const account = await connection.getAccount({ address: testConfig.accountStates.noEth.address });
      expect(account).toBeDefined();
      expect(account!.balance).toEqual(testConfig.accountStates.noEth.expectedBalance);

      connection.disconnect();
    });
  });

  describe("getNonce", () => {
    it("can get nonce", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

      // by address
      {
        const nonce = await connection.getNonce({ address: testConfig.accountStates.default.address });
        expect(nonce).toEqual(testConfig.accountStates.default.expectedNonce);
      }

      // by pubkey
      {
        const nonce = await connection.getNonce({ pubkey: testConfig.accountStates.default.pubkey });
        expect(nonce).toEqual(testConfig.accountStates.default.expectedNonce);
      }
      connection.disconnect();
    });
  });

  describe("getNonces", () => {
    it("can get 0/1/2 nonces", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

      // by address, 0 nonces
      {
        const nonces = await connection.getNonces({ address: testConfig.accountStates.default.address }, 0);
        expect(nonces.length).toEqual(0);
      }

      // by address, 1 nonces
      {
        const nonces = await connection.getNonces({ address: testConfig.accountStates.default.address }, 1);
        expect(nonces.length).toEqual(1);
        expect(nonces[0]).toEqual(testConfig.accountStates.default.expectedNonce);
      }

      // by address, 2 nonces
      {
        const nonces = await connection.getNonces({ address: testConfig.accountStates.default.address }, 2);
        expect(nonces.length).toEqual(2);
        expect(nonces[0]).toEqual(testConfig.accountStates.default.expectedNonce);
        expect(nonces[1]).toEqual((testConfig.accountStates.default.expectedNonce + 1) as Nonce);
      }

      // by pubkey, 0 nonces
      {
        const nonces = await connection.getNonces({ pubkey: testConfig.accountStates.default.pubkey }, 0);
        expect(nonces.length).toEqual(0);
      }

      // by pubkey, 1 nonces
      {
        const nonces = await connection.getNonces({ pubkey: testConfig.accountStates.default.pubkey }, 1);
        expect(nonces.length).toEqual(1);
        expect(nonces[0]).toEqual(testConfig.accountStates.default.expectedNonce);
      }

      // by pubkey, 2 nonces
      {
        const nonces = await connection.getNonces({ pubkey: testConfig.accountStates.default.pubkey }, 2);
        expect(nonces.length).toEqual(2);
        expect(nonces[0]).toEqual(testConfig.accountStates.default.expectedNonce);
        expect(nonces[1]).toEqual((testConfig.accountStates.default.expectedNonce + 1) as Nonce);
      }

      connection.disconnect();
    });
  });

  describe("postTx", () => {
    it("can post transaction", async () => {
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipient = await randomAddress();

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipient,
        amount: defaultAmount,
        fee: {
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
        },
        memo: "We \u2665 developers – iov.one",
      };
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, ethereumCodec, nonce);
      const bytesToPost = ethereumCodec.bytesToPost(signed);

      const result = await connection.postTx(bytesToPost);
      expect(result).toBeTruthy();
      expect(result.log).toBeUndefined();

      const blockInfo = await result.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      connection.disconnect();
    }, 30_000);

    it("can post transaction and watch confirmations", async () => {
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipient = await randomAddress();

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipient,
        amount: defaultAmount,
        fee: {
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
        },
        memo: "We \u2665 developers – iov.one",
      };
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, ethereumCodec, nonce);
      const bytesToPost = ethereumCodec.bytesToPost(signed);

      const heightBeforeTransaction = await connection.height();
      const result = await connection.postTx(bytesToPost);
      expect(result).toBeTruthy();
      expect(result.blockInfo.value.state).toEqual(TransactionState.Pending);

      const events = await toListPromise(result.blockInfo.updates, 2);

      expect(events[0]).toEqual({ state: TransactionState.Pending });

      // In Ropsten and Rinkerby, the currentHeight can be less than transactionHeight.
      // Is there some caching for RPC calls happening? Ignore for now.
      expect(events[1]).toEqual({
        state: TransactionState.Succeeded,
        height: heightBeforeTransaction + 1,
        confirmations: 1,
      });

      await sleep(50); // wait for node to update nonce for next test
    }, 30_000);

    it("reports error for gas limit too low", async () => {
      pendingWithoutEthereum();

      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: await randomAddress(),
        amount: defaultAmount,
        fee: {
          gasPrice: testConfig.gasPrice,
          gasLimit: "1",
        },
        memo: "We \u2665 developers – iov.one",
      };
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, ethereumCodec, nonce);
      await connection
        .postTx(ethereumCodec.bytesToPost(signed))
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(testConfig.expectedErrorMessages.gasLimitTooLow));

      connection.disconnect();
    }, 30_000);

    it("reports error for insufficient funds", async () => {
      pendingWithoutEthereum();

      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const brokeIdentity = await profile.createIdentity(
        wallet.id,
        testConfig.chainId,
        HdPaths.ethereum(999),
      );

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: brokeIdentity,
        recipient: await randomAddress(),
        amount: defaultAmount,
        fee: {
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
        },
        memo: "We \u2665 developers – iov.one",
      };
      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, ethereumCodec, nonce);
      await connection
        .postTx(ethereumCodec.bytesToPost(signed))
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(testConfig.expectedErrorMessages.insufficientFunds));

      connection.disconnect();
    }, 30_000);

    // Signature check not stable (https://github.com/trufflesuite/ganache-cli/issues/621)
    xit("reports error for invalid signature", async () => {
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: await randomAddress(),
        amount: defaultAmount,
        fee: {
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
        },
        memo: "We \u2665 developers – iov.one",
      };
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, ethereumCodec, nonce);
      // tslint:disable-next-line:no-bitwise no-object-mutation
      signed.primarySignature.signature[0] ^= 1;
      // Alternatively we could corrupt the message
      // ((signed.transaction as SendTransaction).memo as any) += "!";

      await connection
        .postTx(ethereumCodec.bytesToPost(signed))
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(testConfig.expectedErrorMessages.invalidSignature));

      connection.disconnect();
    }, 30_000);

    it("can send ERC20 tokens", async () => {
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const codec = new EthereumCodec({ erc20Tokens: testConfig.erc20Tokens });
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });

      for (const transferTest of testConfig.erc20TransferTests) {
        const recipientAddress = await randomAddress();

        const sendTx: SendTransaction = {
          kind: "bcp/send",
          creator: mainIdentity,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...transferTest,
        };
        const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
        const signed = await profile.signTransaction(sendTx, codec, nonce);
        const bytesToPost = codec.bytesToPost(signed);

        const result = await connection.postTx(bytesToPost);
        expect(result).toBeTruthy();
        expect(result.log).toBeUndefined();

        const blockInfo = await result.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);

        const recipientAccount = await connection.getAccount({ address: recipientAddress });
        const erc20Balance = recipientAccount!.balance.find(
          entry => entry.tokenTicker === transferTest.amount.tokenTicker,
        );
        expect(erc20Balance!.quantity).toEqual(transferTest.amount.quantity);
        expect(erc20Balance!.fractionalDigits).toEqual(transferTest.amount.fractionalDigits);
        expect(erc20Balance!.tokenTicker).toEqual(transferTest.amount.tokenTicker);
      }

      connection.disconnect();
    }, 90_000);
  });

  describe("watchAccount", () => {
    it("can watch an account", done => {
      pendingWithoutEthereum();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

        const recipient = await randomAddress();

        // setup watching
        const events = new Array<Account | undefined>();
        const subscription = connection.watchAccount({ address: recipient }).subscribe({
          next: event => {
            events.push(event);

            if (event) {
              expect(event.address).toEqual(recipient);
              expect(event.balance.length).toEqual(1);
              expect(event.balance[0].fractionalDigits).toEqual(18);
              expect(event.balance[0].tokenTicker).toEqual("ETH");
            }

            if (events.length === 2) {
              expect(events[0]).toBeUndefined();
              expect(events[1]).toBeDefined();
              expect(events[1]!.balance[0].quantity).toEqual(defaultAmount.quantity);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
        });

        // post transactions
        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));
        const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
        await postTransaction(profile, mainIdentity, nonce, recipient, connection);
      })().catch(done.fail);
    }, 90_000);
  });

  describe("searchTx", () => {
    it("throws error for invalid transaction hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      // invalid lenght
      const invalidHashLenght = "0x1234567890abcdef" as TransactionId;
      await connection
        .searchTx({ id: invalidHashLenght })
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/Invalid transaction ID format/i));
      connection.disconnect();
    });

    it("can search non-existing transaction by hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const nonExistingHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as TransactionId;
      const results = await connection.searchTx({ id: nonExistingHash });
      expect(results.length).toEqual(0);
      connection.disconnect();
    });

    it("can search previous posted transaction by hash", async () => {
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipient = await randomAddress();

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipient,
        amount: defaultAmount,
        fee: {
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
        },
        memo: `Search tx test ${Math.random()}`,
      };
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, ethereumCodec, nonce);
      const bytesToPost = ethereumCodec.bytesToPost(signed);

      const resultPost = await connection.postTx(bytesToPost);
      expect(resultPost.transactionId).toMatch(/^0x[0-9a-f]{64}$/);
      await resultPost.blockInfo.waitFor(info => !isBlockInfoPending(info));

      const resultSearch = await connection.searchTx({ id: resultPost.transactionId });
      expect(resultSearch.length).toEqual(1);
      const result = resultSearch[0];
      expect(result.transactionId).toEqual(resultPost.transactionId);
      expect(result.confirmations).toEqual(1);
      const transaction = result.transaction;
      if (!isSendTransaction(transaction)) {
        throw new Error("Unexpected transaction type");
      }
      expect(transaction.recipient).toEqual(recipient);
      expect(transaction.amount.quantity).toEqual("445500");
      expect(transaction.creator.pubkey).toEqual(mainIdentity.pubkey);
      connection.disconnect();
    }, 30_000);

    it("can search a transaction by account", async () => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const results = await connection.searchTx({ sentFromOrTo: testConfig.accountStates.default.address });
      expect(results.length).toBeGreaterThan(1);
      connection.disconnect();
    });

    it("can search transactions by account and minHeight/maxHeight", async () => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipientAddress = await randomAddress();

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipientAddress,
        amount: defaultAmount,
        fee: {
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
        },
        memo: `Search tx test ${new Date()}`,
      };
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(sendTx, ethereumCodec, nonce);
      const bytesToPost = ethereumCodec.bytesToPost(signed);

      const resultPost = await connection.postTx(bytesToPost);
      const transactionId = resultPost.transactionId;
      const blockInfo = await resultPost.blockInfo.waitFor(info => !isBlockInfoPending(info));
      const transactionHeight = (blockInfo as BlockInfoSucceeded | BlockInfoFailed).height;

      // Random delay to give scraper a chance to receive and process the new block
      await sleep(25_000);

      // min height less than transaction height
      {
        const resultSearch = await connection.searchTx({
          minHeight: transactionHeight - 1,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(1);
        expect(resultSearch[0].transactionId).toEqual(transactionId);
      }

      // min height equals transaction height
      {
        const resultSearch = await connection.searchTx({
          minHeight: transactionHeight,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(1);
        expect(resultSearch[0].transactionId).toEqual(transactionId);
      }

      // min height greater than transaction height
      {
        const resultSearch = await connection.searchTx({
          minHeight: transactionHeight + 1,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(0);
      }

      // max height less than transaction height
      {
        const resultSearch = await connection.searchTx({
          maxHeight: transactionHeight - 1,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(0);
      }

      // max height equals transaction height
      {
        const resultSearch = await connection.searchTx({
          maxHeight: transactionHeight,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(1);
        expect(resultSearch[0].transactionId).toEqual(transactionId);
      }

      // max height greater than transaction height
      {
        const resultSearch = await connection.searchTx({
          maxHeight: transactionHeight + 1,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(1);
        expect(resultSearch[0].transactionId).toEqual(transactionId);
      }

      // min height less than max height
      {
        const resultSearch = await connection.searchTx({
          minHeight: transactionHeight - 1,
          maxHeight: transactionHeight + 1,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(1);
        expect(resultSearch[0].transactionId).toEqual(transactionId);
      }

      // min height equal to max height
      {
        const resultSearch = await connection.searchTx({
          minHeight: transactionHeight,
          maxHeight: transactionHeight,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(1);
        expect(resultSearch[0].transactionId).toEqual(transactionId);
      }

      // min height greater than max height
      {
        const resultSearch = await connection.searchTx({
          minHeight: transactionHeight,
          maxHeight: transactionHeight - 1,
          sentFromOrTo: recipientAddress,
        });
        expect(resultSearch.length).toEqual(0);
      }

      connection.disconnect();
    }, 60_000);

    it("lists ERC20 transactions when searching by recipient", async () => {
      pendingWithoutEthereum();

      const codec = new EthereumCodec({ erc20Tokens: testConfig.erc20Tokens });
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipient = await randomAddress();

      for (const sendTest of testConfig.erc20TransferTests) {
        let transactionId: TransactionId;

        // send
        {
          const sendTx: SendTransaction = {
            kind: "bcp/send",
            creator: mainIdentity,
            recipient: recipient,
            fee: {
              gasPrice: testConfig.gasPrice,
              gasLimit: testConfig.gasLimit,
            },
            ...sendTest,
          };
          const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
          const signed = await profile.signTransaction(sendTx, codec, nonce);
          const resultPost = await connection.postTx(codec.bytesToPost(signed));
          transactionId = resultPost.transactionId;
          await resultPost.blockInfo.waitFor(info => !isBlockInfoPending(info));
        }

        // search by recipient
        {
          const resultSearch = await connection.searchTx({ sentFromOrTo: recipient });
          expect(resultSearch.length).toBeGreaterThanOrEqual(1);
          const latestResult = resultSearch[0];
          expect(latestResult.transactionId).toEqual(transactionId);
          expect(latestResult.confirmations).toEqual(1);
          const transaction = latestResult.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error("Unexpected transaction type");
          }
          expect(transaction.creator).toEqual(mainIdentity);
          expect(transaction.recipient).toEqual(recipient);
          expect(transaction.amount).toEqual(sendTest.amount);
          expect(transaction.memo).toBeUndefined();
        }
      }

      connection.disconnect();
    }, 90_000);

    it("lists ERC20 transactions when searching by sender", async () => {
      pendingWithoutEthereum();

      const codec = new EthereumCodec({ erc20Tokens: testConfig.erc20Tokens });
      const connection = await EthereumConnection.establish(testConfig.base, {
        ...testConfig.connectionOptions,
        erc20Tokens: testConfig.erc20Tokens,
      });
      // filter search result by min height to avoid long test run time
      const minHeight = (await connection.height()) - 10;

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipient = await randomAddress();

      for (const sendTest of testConfig.erc20TransferTests) {
        let transactionId: TransactionId;

        // send
        {
          const sendTx: SendTransaction = {
            kind: "bcp/send",
            creator: mainIdentity,
            recipient: recipient,
            fee: {
              gasPrice: testConfig.gasPrice,
              gasLimit: testConfig.gasLimit,
            },
            ...sendTest,
          };
          const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
          const signed = await profile.signTransaction(sendTx, codec, nonce);
          const resultPost = await connection.postTx(codec.bytesToPost(signed));
          transactionId = resultPost.transactionId;
          await resultPost.blockInfo.waitFor(info => !isBlockInfoPending(info));
        }

        // search by sender
        {
          const senderAddress = pubkeyToAddress(mainIdentity.pubkey);
          const resultSearch = await connection.searchTx({
            sentFromOrTo: senderAddress,
            minHeight: minHeight,
          });
          expect(resultSearch.length).toBeGreaterThanOrEqual(1);
          const latestResult = resultSearch[0];
          expect(latestResult.transactionId).toEqual(transactionId);
          expect(latestResult.confirmations).toEqual(1);
          const transaction = latestResult.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error("Unexpected transaction type");
          }
          expect(transaction.creator).toEqual(mainIdentity);
          expect(transaction.recipient).toEqual(recipient);
          expect(transaction.amount).toEqual(sendTest.amount);
          expect(transaction.memo).toBeUndefined();
        }
      }

      connection.disconnect();
    }, 90_000);
  });

  describe("listenTx", () => {
    it("can listen to transactions", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const codec = new EthereumCodec({ erc20Tokens: testConfig.erc20Tokens });
        const connection = await EthereumConnection.establish(testConfig.base, {
          ...testConfig.connectionOptions,
          erc20Tokens: testConfig.erc20Tokens,
        });

        const recipientAddress = await randomAddress();

        // setup listener
        const transactionIds = new Set<TransactionId>();
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection.listenTx({ sentFromOrTo: recipientAddress }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              throw new Error("Confirmed transaction expected");
            }

            events.push(event);

            if (!isSendTransaction(event.transaction)) {
              throw new Error("Unexpected transaction type");
            }
            expect(event.transaction.recipient).toEqual(recipientAddress);
            expect(event.transaction.creator).toEqual(sender);
            expect(event.primarySignature.pubkey).toEqual(sender.pubkey);

            if (events.length === 3) {
              // The order of the events 0, 1, 2 does not necessarily correspond to the send
              // order A, B, C. However, we can at least make sure we got the right ones.
              const receivedIds = new Set(events.map(e => e.transactionId));
              expect(receivedIds).toEqual(transactionIds);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
        });

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `listenTx() test A ${Math.random()}`,
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `listenTx() test B ${Math.random()}`,
        };

        // an ERC 20 token transfer
        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);

        const signedA = await profile.signTransaction(sendA, codec, nonceA);
        const signedB = await profile.signTransaction(sendB, codec, nonceB);
        const signedC = await profile.signTransaction(sendC, codec, nonceC);
        const bytesToPostA = codec.bytesToPost(signedA);
        const bytesToPostB = codec.bytesToPost(signedB);
        const bytesToPostC = codec.bytesToPost(signedC);

        // Post A, B, C in parallel
        const [postResultA, postResultB, postResultC] = await Promise.all([
          connection.postTx(bytesToPostA),
          connection.postTx(bytesToPostB),
          connection.postTx(bytesToPostC),
        ]);

        transactionIds.add(postResultA.transactionId);
        transactionIds.add(postResultB.transactionId);
        transactionIds.add(postResultC.transactionId);

        // Wait for transaction success
        await Promise.all([
          postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info)),
          postResultB.blockInfo.waitFor(info => !isBlockInfoPending(info)),
          postResultC.blockInfo.waitFor(info => !isBlockInfoPending(info)),
        ]);
      })().catch(done.fail);
    }, 90_000);
  });

  describe("liveTx", () => {
    const waitForAdditionalEventsMs = 3 * (testConfig.connectionOptions.pollInterval || 4) * 1000;

    it("works for ETH transactions by recipient (in history and updates)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test A ${Math.random()}`,
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test B ${Math.random()}`,
        };

        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test C ${Math.random()}`,
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);

        const signedA = await profile.signTransaction(sendA, ethereumCodec, nonceA);
        const signedB = await profile.signTransaction(sendB, ethereumCodec, nonceB);
        const signedC = await profile.signTransaction(sendC, ethereumCodec, nonceC);
        const bytesToPostA = ethereumCodec.bytesToPost(signedA);
        const bytesToPostB = ethereumCodec.bytesToPost(signedB);
        const bytesToPostC = ethereumCodec.bytesToPost(signedC);

        const transactionIds = new Set<TransactionId>();

        // Post A and B in parallel
        const [postResultA, postResultB] = await Promise.all([
          connection.postTx(bytesToPostA),
          connection.postTx(bytesToPostB),
        ]);
        transactionIds.add(postResultA.transactionId);
        transactionIds.add(postResultB.transactionId);

        // Wait for a block
        await postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info));
        await postResultB.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // setup listener after A and B are in block
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection.liveTx({ sentFromOrTo: recipientAddress }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              throw new Error("Confirmed transaction expected");
            }

            events.push(event);

            if (!isSendTransaction(event.transaction)) {
              throw new Error("Unexpected transaction type");
            }
            expect(event.transaction.recipient).toEqual(recipientAddress);
            expect(event.transaction.creator).toEqual(sender);
            expect(event.primarySignature.pubkey).toEqual(sender.pubkey);

            if (events.length === 3) {
              const receivedIds = new Set(events.map(e => e.transactionId));
              expect(receivedIds).toEqual(transactionIds);

              setTimeout(() => {
                // ensure no more events received
                expect(events.length).toEqual(3);

                subscription.unsubscribe();
                connection.disconnect();
                done();
              }, waitForAdditionalEventsMs);
            }
          },
        });

        // Post C
        const postResultC = await connection.postTx(bytesToPostC);
        transactionIds.add(postResultC.transactionId);
      })().catch(done.fail);
    }, 70_000);

    it("works for ETH transactions by sender (in history and updates)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
        // only future transactions for this test
        const minHeight = (await connection.height()) + 1;

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const senderAddress = pubkeyToAddress(sender.pubkey);
        const recipientAddress = await randomAddress();

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test A ${Math.random()}`,
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test B ${Math.random()}`,
        };

        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test C ${Math.random()}`,
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);

        const signedA = await profile.signTransaction(sendA, ethereumCodec, nonceA);
        const signedB = await profile.signTransaction(sendB, ethereumCodec, nonceB);
        const signedC = await profile.signTransaction(sendC, ethereumCodec, nonceC);
        const bytesToPostA = ethereumCodec.bytesToPost(signedA);
        const bytesToPostB = ethereumCodec.bytesToPost(signedB);
        const bytesToPostC = ethereumCodec.bytesToPost(signedC);

        const transactionIds = new Set<TransactionId>();

        // Post A and B in parallel
        const [postResultA, postResultB] = await Promise.all([
          connection.postTx(bytesToPostA),
          connection.postTx(bytesToPostB),
        ]);
        transactionIds.add(postResultA.transactionId);
        transactionIds.add(postResultB.transactionId);

        // Wait for a block
        await postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info));
        await postResultB.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // setup listener after A and B are in block
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection
          .liveTx({ sentFromOrTo: senderAddress, minHeight: minHeight })
          .subscribe({
            next: event => {
              if (!isConfirmedTransaction(event)) {
                throw new Error("Confirmed transaction expected");
              }

              events.push(event);

              if (!isSendTransaction(event.transaction)) {
                throw new Error("Unexpected transaction type");
              }
              expect(event.transaction.recipient).toEqual(recipientAddress);
              expect(event.transaction.creator).toEqual(sender);
              expect(event.primarySignature.pubkey).toEqual(sender.pubkey);

              if (events.length === 3) {
                const receivedIds = new Set(events.map(e => e.transactionId));
                expect(receivedIds).toEqual(transactionIds);

                setTimeout(() => {
                  // ensure no more events received
                  expect(events.length).toEqual(3);

                  subscription.unsubscribe();
                  connection.disconnect();
                  done();
                }, waitForAdditionalEventsMs);
              }
            },
          });

        // Post C
        const postResultC = await connection.postTx(bytesToPostC);
        transactionIds.add(postResultC.transactionId);
      })().catch(done.fail);
    }, 70_000);

    it("works for ERC20 transactions by recipient (in history and updates)", done => {
      pendingWithoutEthereum();

      (async () => {
        const codec = new EthereumCodec({ erc20Tokens: testConfig.erc20Tokens });
        const connection = await EthereumConnection.establish(testConfig.base, {
          ...testConfig.connectionOptions,
          erc20Tokens: testConfig.erc20Tokens,
        });

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);

        const signedA = await profile.signTransaction(sendA, codec, nonceA);
        const signedB = await profile.signTransaction(sendB, codec, nonceB);
        const signedC = await profile.signTransaction(sendC, codec, nonceC);
        const bytesToPostA = codec.bytesToPost(signedA);
        const bytesToPostB = codec.bytesToPost(signedB);
        const bytesToPostC = codec.bytesToPost(signedC);

        const transactionIds = new Set<TransactionId>();

        // Post A and B, wait for a block
        const postResultA = await connection.postTx(bytesToPostA);
        const postResultB = await connection.postTx(bytesToPostB);
        transactionIds.add(postResultA.transactionId);
        transactionIds.add(postResultB.transactionId);
        await postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info));
        await postResultB.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // setup listener after A and B are in block
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection.liveTx({ sentFromOrTo: recipientAddress }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              throw new Error("Confirmed transaction expected");
            }

            events.push(event);

            if (!isSendTransaction(event.transaction)) {
              throw new Error("Unexpected transaction type");
            }
            expect(event.transaction.recipient).toEqual(recipientAddress);
            expect(event.transaction.creator).toEqual(sender);
            expect(event.primarySignature.pubkey).toEqual(sender.pubkey);

            if (events.length === 3) {
              const receivedIds = new Set(events.map(e => e.transactionId));
              expect(receivedIds).toEqual(transactionIds);

              setTimeout(() => {
                // ensure no more events received
                expect(events.length).toEqual(3);

                subscription.unsubscribe();
                connection.disconnect();
                done();
              }, waitForAdditionalEventsMs);
            }
          },
        });

        // Post C
        const postResultC = await connection.postTx(bytesToPostC);
        transactionIds.add(postResultC.transactionId);
      })().catch(done.fail);
    }, 70_000);

    it("works for ERC20 transactions by sender (in history and updates)", done => {
      pendingWithoutEthereum();

      (async () => {
        const codec = new EthereumCodec({ erc20Tokens: testConfig.erc20Tokens });
        const connection = await EthereumConnection.establish(testConfig.base, {
          ...testConfig.connectionOptions,
          erc20Tokens: testConfig.erc20Tokens,
        });
        // only future transactions for this test
        const minHeight = (await connection.height()) + 1;

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const senderAddress = pubkeyToAddress(sender.pubkey);
        const recipientAddress = await randomAddress();

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);

        const signedA = await profile.signTransaction(sendA, codec, nonceA);
        const signedB = await profile.signTransaction(sendB, codec, nonceB);
        const signedC = await profile.signTransaction(sendC, codec, nonceC);
        const bytesToPostA = codec.bytesToPost(signedA);
        const bytesToPostB = codec.bytesToPost(signedB);
        const bytesToPostC = codec.bytesToPost(signedC);

        const transactionIds = new Set<TransactionId>();

        // Post A and B, wait for a block
        const postResultA = await connection.postTx(bytesToPostA);
        const postResultB = await connection.postTx(bytesToPostB);
        transactionIds.add(postResultA.transactionId);
        transactionIds.add(postResultB.transactionId);
        await postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info));
        await postResultB.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // setup listener after A and B are in block
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection
          .liveTx({ sentFromOrTo: senderAddress, minHeight: minHeight })
          .subscribe({
            next: event => {
              if (!isConfirmedTransaction(event)) {
                throw new Error("Confirmed transaction expected");
              }

              events.push(event);

              if (!isSendTransaction(event.transaction)) {
                throw new Error("Unexpected transaction type");
              }
              expect(event.transaction.recipient).toEqual(recipientAddress);
              expect(event.transaction.creator).toEqual(sender);
              expect(event.primarySignature.pubkey).toEqual(sender.pubkey);

              if (events.length === 3) {
                const receivedIds = new Set(events.map(e => e.transactionId));
                expect(receivedIds).toEqual(transactionIds);

                setTimeout(() => {
                  // ensure no more events received
                  expect(events.length).toEqual(3);

                  subscription.unsubscribe();
                  connection.disconnect();
                  done();
                }, waitForAdditionalEventsMs);
              }
            },
          });

        // Post C
        const postResultC = await connection.postTx(bytesToPostC);
        transactionIds.add(postResultC.transactionId);
      })().catch(done.fail);
    }, 70_000);

    it("works for ETH and ERC20 transactions by recipient (in history and updates)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const codec = new EthereumCodec({ erc20Tokens: testConfig.erc20Tokens });
        const connection = await EthereumConnection.establish(testConfig.base, {
          ...testConfig.connectionOptions,
          erc20Tokens: testConfig.erc20Tokens,
        });

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          amount: defaultAmount,
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          amount: defaultAmount,
        };

        const sendD: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          ...testConfig.erc20TransferTests[0],
        };

        const [nonceA, nonceB, nonceC, nonceD] = await connection.getNonces({ pubkey: sender.pubkey }, 4);

        const signedA = await profile.signTransaction(sendA, codec, nonceA);
        const signedB = await profile.signTransaction(sendB, codec, nonceB);
        const signedC = await profile.signTransaction(sendC, codec, nonceC);
        const signedD = await profile.signTransaction(sendD, codec, nonceD);
        const bytesToPostA = codec.bytesToPost(signedA);
        const bytesToPostB = codec.bytesToPost(signedB);
        const bytesToPostC = codec.bytesToPost(signedC);
        const bytesToPostD = codec.bytesToPost(signedD);

        const transactionIds = new Set<TransactionId>();

        // Post A and B, wait for a block
        const [postResultA, postResultB] = await Promise.all([
          connection.postTx(bytesToPostA),
          connection.postTx(bytesToPostB),
        ]);
        transactionIds.add(postResultA.transactionId);
        transactionIds.add(postResultB.transactionId);
        await postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info));
        await postResultB.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // setup listener after A and B are in block
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection.liveTx({ sentFromOrTo: recipientAddress }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              throw new Error("Confirmed transaction expected");
            }

            events.push(event);

            if (!isSendTransaction(event.transaction)) {
              throw new Error("Unexpected transaction type");
            }
            expect(event.transaction.recipient).toEqual(recipientAddress);
            expect(event.transaction.creator).toEqual(sender);
            expect(event.primarySignature.pubkey).toEqual(sender.pubkey);

            if (events.length === 4) {
              const receivedIds = new Set(events.map(e => e.transactionId));
              expect(receivedIds).toEqual(transactionIds);

              setTimeout(() => {
                // ensure no more events received
                expect(events.length).toEqual(4);

                subscription.unsubscribe();
                connection.disconnect();
                done();
              }, waitForAdditionalEventsMs);
            }
          },
        });

        // Post C and D in parallel
        const [postResultC, postResultD] = await Promise.all([
          connection.postTx(bytesToPostC),
          connection.postTx(bytesToPostD),
        ]);
        transactionIds.add(postResultC.transactionId);
        transactionIds.add(postResultD.transactionId);
      })().catch(done.fail);
    }, 80_000);

    it("works for transactions by ID (in history)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const recipientAddress = await randomAddress();
        const send: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test ${Math.random()}`,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(send, ethereumCodec, nonce);
        const bytesToPost = ethereumCodec.bytesToPost(signed);

        const postResult = await connection.postTx(bytesToPost);
        const transactionId = postResult.transactionId;

        // Wait for a block
        await postResult.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // setup listener after transaction is in block
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection.liveTx({ id: transactionId }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              throw new Error("Confirmed transaction expected");
            }

            events.push(event);

            if (!isSendTransaction(event.transaction)) {
              throw new Error("Unexpected transaction type");
            }
            expect(event.transaction.recipient).toEqual(recipientAddress);
            expect(event.transactionId).toEqual(transactionId);

            subscription.unsubscribe();
            connection.disconnect();
            done();
          },
        });
      })().catch(done.fail);
    }, 30_000);

    it("works for transactions by ID (in updates)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const send: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          fee: {
            gasPrice: testConfig.gasPrice,
            gasLimit: testConfig.gasLimit,
          },
          memo: `liveTx() test ${Math.random()}`,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(send, ethereumCodec, nonce);
        const bytesToPost = ethereumCodec.bytesToPost(signed);

        const postResult = await connection.postTx(bytesToPost);
        const transactionId = postResult.transactionId;

        // setup listener before transaction is in block
        const events = new Array<ConfirmedTransaction>();
        const subscription = connection.liveTx({ id: transactionId }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              throw new Error("Confirmed transaction expected");
            }

            events.push(event);

            if (!isSendTransaction(event.transaction)) {
              throw new Error("Unexpected transaction type");
            }
            expect(event.transaction.recipient).toEqual(recipientAddress);
            expect(event.transactionId).toEqual(transactionId);

            subscription.unsubscribe();
            connection.disconnect();
            done();
          },
        });
      })().catch(done.fail);
    }, 30_000);
  });

  describe("getBlockHeader", () => {
    it("can get header from block", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const blockHeader = await connection.getBlockHeader(0);
      expect(blockHeader.id).toMatch(/^0x[0-9a-f]{64}$/);
      expect(blockHeader.height).toEqual(0);
      expect(blockHeader.transactionCount).toBeGreaterThanOrEqual(0);
      connection.disconnect();
    });

    it("throws error from invalid block number", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      await connection
        .getBlockHeader(99999999999999)
        .then(() => fail("promise must be rejected"))
        .catch(err => expect(err).toMatch(/Header 99999999999999 doesn't exist yet/));
      connection.disconnect();
    });
  });

  describe("watchBlockHeaders", () => {
    it("watches headers with same data as getBlockHeader", done => {
      pendingWithoutEthereum();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
        const events = new Array<BlockHeader>();

        const subscription = connection.watchBlockHeaders().subscribe({
          next: async event => {
            try {
              // check this event
              const header = await connection.getBlockHeader(event.height);
              expect(header).toEqual(event);

              // add event
              events.push(event);

              // sum up events
              if (events.length === 2) {
                expect(events[0].height).toEqual(events[1].height - 1);
                subscription.unsubscribe();
                connection.disconnect();
                done();
              }
            } catch (error) {
              done.fail(error);
            }
          },
          complete: done.fail,
          error: done.fail,
        });

        // post transactions
        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(testConfig.mnemonic));
        const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

        const [nonceA, nonceB] = await connection.getNonces({ pubkey: mainIdentity.pubkey }, 2);
        const recipient = await randomAddress();
        await postTransaction(profile, mainIdentity, nonceA, recipient, connection);
        await postTransaction(profile, mainIdentity, nonceB, recipient, connection);
      })().catch(done.fail);
    }, 45_000);
  });

  describe("getFeeQuote", () => {
    it("works for send transaction", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

      const sendTransaction: SendTransaction = {
        kind: "bcp/send",
        creator: {
          chainId: connection.chainId(),
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("aabbccdd") as PublicKeyBytes,
          },
        },
        recipient: await randomAddress(),
        memo: `We ❤️ developers – iov.one ${Math.random()}`,
        amount: defaultAmount,
      };
      const result = await connection.getFeeQuote(sendTransaction);
      expect(result.tokens).toBeUndefined();
      expect(result.gasPrice).toEqual({
        // 20 gwei
        quantity: "20000000000",
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      });
      expect(result.gasLimit).toEqual("2100000");

      connection.disconnect();
    });

    it("throws for unsupported transaction kind", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);

      const otherTransaction: UnsignedTransaction = {
        kind: "other/kind",
        creator: {
          chainId: connection.chainId(),
          pubkey: {
            algo: Algorithm.Secp256k1,
            data: fromHex("aabbccdd") as PublicKeyBytes,
          },
        },
      };
      await connection
        .getFeeQuote(otherTransaction)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/transaction of unsupported kind/i));

      connection.disconnect();
    });
  });

  describe("atomic swap", () => {
    it("can start atomic swap", async () => {
      pendingWithoutEthereum();

      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddress = ethereumCodec.identityToAddress(faucet);
      const recipientAddress = await randomAddress();

      const initSwaps = await connection.getSwaps({ recipient: recipientAddress });
      expect(initSwaps.length).toEqual(0);

      const swapId = await EthereumConnection.createEtherSwapId();
      const swapOfferPreimage = await AtomicSwapHelpers.createPreimage();
      const swapOfferHash = AtomicSwapHelpers.hashPreimage(swapOfferPreimage);

      const swapOfferTimeout: SwapTimeout = {
        height: (await connection.height()) + 5,
      };
      const amount = {
        quantity: "123000456000",
        fractionalDigits: 18,
        tokenTicker: ETH,
      };
      const swapOfferTx = await connection.withDefaultFee<SwapOfferTransaction>({
        kind: "bcp/swap_offer",
        creator: faucet,
        swapId: swapId,
        recipient: recipientAddress,
        amounts: [amount],
        timeout: swapOfferTimeout,
        hash: swapOfferHash,
      });

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(swapOfferTx, ethereumCodec, nonce);
      const result = await connection.postTx(ethereumCodec.bytesToPost(signed));
      expect(result).toBeTruthy();
      expect(result.log).toBeUndefined();

      const { transactionId } = result;
      expect(transactionId).toMatch(/^0x[0-9a-f]{64}$/i);

      const blockInfo = await result.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo.state}`);
      }

      // now query by the txid
      const search = (await connection.searchTx({ id: transactionId })).filter(isConfirmedTransaction);
      expect(search.length).toEqual(1);
      // make sure we get the same tx loaded
      const loaded = search[0];
      expect(loaded.transactionId).toEqual(transactionId);
      expect(loaded.height).toEqual(blockInfo.height);
      const loadedTransaction = loaded.transaction;
      if (!isSwapOfferTransaction(loadedTransaction)) {
        throw new Error("Wrong transaction type");
      }
      expect(loadedTransaction.recipient).toEqual(swapOfferTx.recipient);

      // prepare queries
      const queryTransactionId: TransactionQuery = { id: transactionId };
      const querySwapId: AtomicSwapQuery = { id: swapId };
      const querySwapSender: AtomicSwapQuery = { sender: faucetAddress };
      const querySwapRecipient: AtomicSwapQuery = { recipient: recipientAddress };
      const querySwapHash: AtomicSwapQuery = { hash: swapOfferHash };

      // ----- connection.searchTx() -----

      const txById = (await connection.searchTx(queryTransactionId)).filter(isConfirmedTransaction);
      expect(txById.length).toEqual(1);
      expect(txById[0].transactionId).toEqual(transactionId);

      // ----- connection.getSwaps() -------

      // we can get swap by id
      const idSwaps = await connection.getSwaps(querySwapId);
      expect(idSwaps.length).toEqual(1);

      const swap = idSwaps[0];
      expect(swap.kind).toEqual(SwapProcessState.Open);

      const swapData = swap.data;
      expect(swapData.id).toEqual(swapId);
      expect(swapData.sender).toEqual(faucetAddress);
      expect(swapData.recipient).toEqual(recipientAddress);
      expect(swapData.timeout).toEqual(swapOfferTimeout);
      expect(swapData.amounts.length).toEqual(1);
      expect(swapData.amounts[0]).toEqual(amount);
      expect(swapData.hash).toEqual(swapOfferHash);

      // we can get the swap by the recipient
      const rcptSwaps = await connection.getSwaps(querySwapRecipient);
      expect(rcptSwaps.length).toEqual(1);
      expect(rcptSwaps[0]).toEqual(swap);

      // we can also get it by the sender
      const sendOpenSwapData = (await connection.getSwaps(querySwapSender)).filter(
        s => s.kind === SwapProcessState.Open,
      );
      expect(sendOpenSwapData.length).toBeGreaterThanOrEqual(1);
      expect(sendOpenSwapData[sendOpenSwapData.length - 1]).toEqual(swap);

      // we can also get it by the hash
      const hashSwap = await connection.getSwaps(querySwapHash);
      expect(hashSwap.length).toEqual(1);
      expect(hashSwap[0]).toEqual(swap);

      connection.disconnect();
    }, 30_000);

    const openSwap = async (
      connection: EthereumConnection,
      profile: UserProfile,
      creator: PublicIdentity,
      rcptAddr: Address,
      hash: Hash,
      swapId: SwapId,
      timeoutOffset: number = 1000,
    ): Promise<PostTxResponse> => {
      // construct a swapOfferTx, sign and post to the chain
      const swapOfferTimeout: SwapTimeout = {
        height: (await connection.height()) + timeoutOffset,
      };
      const swapOfferTx = await connection.withDefaultFee<SwapOfferTransaction>({
        kind: "bcp/swap_offer",
        swapId: swapId,
        creator: creator,
        recipient: rcptAddr,
        amounts: [
          {
            quantity: "21000000000",
            fractionalDigits: 18,
            tokenTicker: ETH,
          },
        ],
        timeout: swapOfferTimeout,
        hash: hash,
      });
      const nonce = await connection.getNonce({ pubkey: creator.pubkey });
      const signed = await profile.signTransaction(swapOfferTx, ethereumCodec, nonce);
      const txBytes = ethereumCodec.bytesToPost(signed);
      return connection.postTx(txBytes);
    };

    const claimSwap = async (
      connection: EthereumConnection,
      profile: UserProfile,
      creator: PublicIdentity,
      swapId: SwapId,
      preimage: Preimage,
    ): Promise<PostTxResponse> => {
      // construct a swapOfferTx, sign and post to the chain
      const swapClaimTx = await connection.withDefaultFee<SwapClaimTransaction>({
        kind: "bcp/swap_claim",
        creator: creator,
        swapId: swapId,
        preimage: preimage,
      });
      const nonce = await connection.getNonce({ pubkey: creator.pubkey });
      const signed = await profile.signTransaction(swapClaimTx, ethereumCodec, nonce);
      const txBytes = ethereumCodec.bytesToPost(signed);
      return connection.postTx(txBytes);
    };

    const abortSwap = async (
      connection: EthereumConnection,
      profile: UserProfile,
      creator: PublicIdentity,
      swapId: SwapId,
    ): Promise<PostTxResponse> => {
      const swapAbortTx = await connection.withDefaultFee<SwapAbortTransaction>({
        kind: "bcp/swap_abort",
        creator: creator,
        swapId: swapId,
      });
      const nonce = await connection.getNonce({ pubkey: creator.pubkey });
      const signed = await profile.signTransaction(swapAbortTx, ethereumCodec, nonce);
      const txBytes = ethereumCodec.bytesToPost(signed);
      return connection.postTx(txBytes);
    };

    it("can start and watch an atomic swap lifecycle", async () => {
      pendingWithoutEthereum();

      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const recipientAddress = await randomAddress();

      // create the preimages for the three swaps
      const swapId1 = await EthereumConnection.createEtherSwapId();
      const preimage1 = await AtomicSwapHelpers.createPreimage();
      const hash1 = AtomicSwapHelpers.hashPreimage(preimage1);
      const swapId2 = await EthereumConnection.createEtherSwapId();
      const preimage2 = await AtomicSwapHelpers.createPreimage();
      const hash2 = AtomicSwapHelpers.hashPreimage(preimage2);
      const swapId3 = await EthereumConnection.createEtherSwapId();
      const preimage3 = await AtomicSwapHelpers.createPreimage();
      const hash3 = AtomicSwapHelpers.hashPreimage(preimage3);

      // nothing to start with
      const rcptQuery = { recipient: recipientAddress };
      const initSwaps = await connection.getSwaps(rcptQuery);
      expect(initSwaps.length).toEqual(0);

      // make two offers
      const post1 = await openSwap(connection, profile, faucet, recipientAddress, hash1, swapId1);
      const blockInfo1 = await post1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo1)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo1.state}`);
      }

      const post2 = await openSwap(connection, profile, faucet, recipientAddress, hash2, swapId2);
      const blockInfo2 = await post2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo2)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo2.state}`);
      }

      // find two open
      const midSwaps = await connection.getSwaps(rcptQuery);
      expect(midSwaps.length).toEqual(2);
      const open1 = midSwaps.find(matchId(swapId1));
      const open2 = midSwaps.find(matchId(swapId2));
      expect(open1).toBeDefined();
      expect(open2).toBeDefined();
      expect(open1!.kind).toEqual(SwapProcessState.Open);
      expect(open2!.kind).toEqual(SwapProcessState.Open);

      // then claim, offer, claim - 2 closed, 1 open
      {
        const post = await claimSwap(connection, profile, faucet, swapId2, preimage2);
        await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      const post3 = await openSwap(connection, profile, faucet, recipientAddress, hash3, swapId3);
      const blockInfo3 = await post3.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo3)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo3.state}`);
      }

      {
        const post = await claimSwap(connection, profile, faucet, swapId1, preimage1);
        await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      // make sure we find two claims, one open
      const finalSwaps = await connection.getSwaps({ recipient: recipientAddress });
      expect(finalSwaps.length).toEqual(3);
      const claim1 = finalSwaps.find(matchId(swapId1));
      const claim2 = finalSwaps.find(matchId(swapId2));
      const open3 = finalSwaps.find(matchId(swapId3));
      expect(claim1).toBeDefined();
      expect(claim2).toBeDefined();
      expect(open3).toBeDefined();
      expect(claim1!.kind).toEqual(SwapProcessState.Claimed);
      expect(claim2!.kind).toEqual(SwapProcessState.Claimed);
      expect(open3!.kind).toEqual(SwapProcessState.Open);
    }, 30_000);

    it("can start and watch aborted atomic swaps", async () => {
      pendingWithoutEthereum();

      const connection = await EthereumConnection.establish(testConfig.base, testConfig.connectionOptions);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const recipientAddress = await randomAddress();

      // create the preimages for the three swaps
      const swapId1 = await EthereumConnection.createEtherSwapId();
      const preimage1 = await AtomicSwapHelpers.createPreimage();
      const hash1 = AtomicSwapHelpers.hashPreimage(preimage1);
      const swapId2 = await EthereumConnection.createEtherSwapId();
      const preimage2 = await AtomicSwapHelpers.createPreimage();
      const hash2 = AtomicSwapHelpers.hashPreimage(preimage2);
      const swapId3 = await EthereumConnection.createEtherSwapId();
      const preimage3 = await AtomicSwapHelpers.createPreimage();
      const hash3 = AtomicSwapHelpers.hashPreimage(preimage3);

      // nothing to start with
      const rcptQuery = { recipient: recipientAddress };
      const initSwaps = await connection.getSwaps(rcptQuery);
      expect(initSwaps.length).toEqual(0);

      // make two offers
      const post1 = await openSwap(connection, profile, faucet, recipientAddress, hash1, swapId1, 1);
      const blockInfo1 = await post1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo1)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo1.state}`);
      }

      const post2 = await openSwap(connection, profile, faucet, recipientAddress, hash2, swapId2, 1);
      const blockInfo2 = await post2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo2)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo2.state}`);
      }

      // then abort, offer, abort - 2 aborted, 1 open
      {
        const post = await abortSwap(connection, profile, faucet, swapId2);
        await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      const post3 = await openSwap(connection, profile, faucet, recipientAddress, hash3, swapId3, 1);
      const blockInfo3 = await post3.blockInfo.waitFor(info => !isBlockInfoPending(info));
      if (!isBlockInfoSucceeded(blockInfo3)) {
        throw new Error(`Expected transaction state success but got state: ${blockInfo3.state}`);
      }

      {
        const post = await abortSwap(connection, profile, faucet, swapId1);
        await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      // make sure we find two claims, one open
      const finalSwaps = await connection.getSwaps({ recipient: recipientAddress });
      expect(finalSwaps.length).toEqual(3);
      const claim1 = finalSwaps.find(matchId(swapId1));
      const claim2 = finalSwaps.find(matchId(swapId2));
      const open3 = finalSwaps.find(matchId(swapId3));
      expect(claim1).toBeDefined();
      expect(claim2).toBeDefined();
      expect(open3).toBeDefined();
      expect(claim1!.kind).toEqual(SwapProcessState.Aborted);
      expect(claim2!.kind).toEqual(SwapProcessState.Aborted);
      expect(open3!.kind).toEqual(SwapProcessState.Open);
    }, 30_000);
  });
});
