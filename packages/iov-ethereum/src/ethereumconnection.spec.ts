import {
  Account,
  Address,
  Algorithm,
  Amount,
  BlockHeader,
  BlockInfoFailed,
  BlockInfoSucceeded,
  ConfirmedTransaction,
  isBlockInfoPending,
  isConfirmedTransaction,
  isSendTransaction,
  Nonce,
  PostTxResponse,
  PublicIdentity,
  PublicKeyBytes,
  SendTransaction,
  SignedTransaction,
  TokenTicker,
  TransactionId,
  TransactionState,
} from "@iov/bcp-types";
import { Random, Secp256k1 } from "@iov/crypto";
import { HdPaths, Secp256k1HdWallet, UserProfile, Wallet } from "@iov/keycontrol";
import { toListPromise } from "@iov/stream";

import { pubkeyToAddress } from "./derivation";
import { ethereumCodec } from "./ethereumcodec";
import { EthereumConnection } from "./ethereumconnection";
import { testConfig } from "./testconfig.spec";

function skipTests(): boolean {
  return !process.env.ETHEREUM_ENABLED;
}

function pendingWithoutEthereum(): void {
  if (skipTests()) {
    return pending("Set ETHEREUM_ENABLED to enable ethereum-node-based tests");
  }
}

function skipTestsScraper(): boolean {
  return !process.env.ETHEREUM_SCRAPER;
}

function pendingWithoutEthereumScraper(): void {
  if (skipTestsScraper()) {
    return pending("Set ETHEREUM_SCRAPER to enable out-of-blockchain functionality tests");
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function randomAddress(): Promise<Address> {
  const keypair = await Secp256k1.makeKeypair(await Random.getBytes(32));
  return pubkeyToAddress({
    algo: Algorithm.Secp256k1,
    data: keypair.pubkey as PublicKeyBytes,
  });
}

describe("EthereumConnection", () => {
  const defaultMnemonic = "oxygen fall sure lava energy veteran enroll frown question detail include maximum";
  const defaultAmount: Amount = {
    quantity: "445500",
    fractionalDigits: 18,
    tokenTicker: "ETH" as TokenTicker,
  };

  async function postTransaction(
    wallet: Wallet,
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
      gasPrice: testConfig.gasPrice,
      gasLimit: testConfig.gasLimit,
      memo: `Some text ${Math.random()}`,
    };
    const signingJob = ethereumCodec.bytesToSign(sendTx, nonce);
    const signature = await wallet.createTransactionSignature(
      sender,
      signingJob.bytes,
      signingJob.prehashType,
    );

    const signedTransaction: SignedTransaction = {
      transaction: sendTx,
      primarySignature: {
        nonce: nonce,
        pubkey: sender.pubkey,
        signature: signature,
      },
      otherSignatures: [],
    };
    const bytesToPost = ethereumCodec.bytesToPost(signedTransaction);

    const resultPost = await connection.postTx(bytesToPost);
    return resultPost;
  }

  it("can be constructed", () => {
    pendingWithoutEthereum();
    const connection = new EthereumConnection(testConfig.base, testConfig.chainId);
    expect(connection).toBeTruthy();
    connection.disconnect();
  });

  it("can get chain ID", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(testConfig.base);
    const chainId = connection.chainId();
    expect(chainId).toEqual(testConfig.chainId);
    connection.disconnect();
  });

  it("can get height", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(testConfig.base);
    const height = await connection.height();
    expect(height).toBeGreaterThanOrEqual(testConfig.minHeight);
    connection.disconnect();
  });

  describe("getTicker", () => {
    it("can get existing ticker", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const ticker = await connection.getTicker("ETH" as TokenTicker);
      expect(ticker).toBeDefined();
      expect(ticker!.tokenTicker).toEqual("ETH");
      expect(ticker!.tokenName).toEqual("Ether");
      expect(ticker!.fractionalDigits).toEqual(18);
      connection.disconnect();
    });

    it("produces empty result for non-existing ticker", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const ticker = await connection.getTicker("ALX" as TokenTicker);
      expect(ticker).toBeUndefined();
      connection.disconnect();
    });
  });

  describe("getTickers", () => {
    it("can get all tickers", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const tickers = await connection.getAllTickers();
      expect(tickers.length).toEqual(1);
      expect(tickers[0].tokenTicker).toEqual("ETH");
      expect(tickers[0].tokenName).toEqual("Ether");
      expect(tickers[0].fractionalDigits).toEqual(18);
      connection.disconnect();
    });
  });

  describe("getAccount", () => {
    it("can get account from address", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const account = await connection.getAccount({ address: testConfig.accountState.address });
      expect(account).toBeDefined();
      expect(account!.address).toEqual(testConfig.accountState.address);
      expect(account!.balance[0]).toEqual({
        ...testConfig.accountState.expectedBalance,
        tokenName: "Ether",
      });
      connection.disconnect();
    });

    it("can get account from pubkey", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const account = await connection.getAccount({ pubkey: testConfig.accountState.pubkey });
      expect(account).toBeDefined();
      expect(account!.address).toEqual(testConfig.accountState.address);
      expect(account!.balance[0]).toEqual({
        ...testConfig.accountState.expectedBalance,
        tokenName: "Ether",
      });
      connection.disconnect();
    });

    it("can get account from unused address", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const account = await connection.getAccount({ address: testConfig.unusedAddress });

      // At the moment we cannot distinguish between unused account and balance 0
      expect(account).toBeDefined();
      expect(account!.balance[0].quantity).toEqual("0");

      connection.disconnect();
    });

    it("can get account from unused pubkey", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const account = await connection.getAccount({ pubkey: testConfig.unusedPubkey });

      // At the moment we cannot distinguish between unused account and balance 0
      expect(account).toBeDefined();
      expect(account!.balance[0].quantity).toEqual("0");

      connection.disconnect();
    });
  });

  describe("getNonce", () => {
    it("can get nonce", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);

      // by address
      {
        const nonce = await connection.getNonce({ address: testConfig.accountState.address });
        expect(nonce).toEqual(testConfig.accountState.expectedNonce);
      }

      // by pubkey
      {
        const nonce = await connection.getNonce({ pubkey: testConfig.accountState.pubkey });
        expect(nonce).toEqual(testConfig.accountState.expectedNonce);
      }
      connection.disconnect();
    });
  });

  describe("getNonces", () => {
    it("can get 0/1/2 nonces", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);

      // by address, 0 nonces
      {
        const nonces = await connection.getNonces({ address: testConfig.accountState.address }, 0);
        expect(nonces.length).toEqual(0);
      }

      // by address, 1 nonces
      {
        const nonces = await connection.getNonces({ address: testConfig.accountState.address }, 1);
        expect(nonces.length).toEqual(1);
        expect(nonces[0].toNumber()).toEqual(testConfig.accountState.expectedNonce.toNumber());
      }

      // by address, 2 nonces
      {
        const nonces = await connection.getNonces({ address: testConfig.accountState.address }, 2);
        expect(nonces.length).toEqual(2);
        expect(nonces[0].toNumber()).toEqual(testConfig.accountState.expectedNonce.toNumber());
        expect(nonces[1].toNumber()).toEqual(testConfig.accountState.expectedNonce.toNumber() + 1);
      }

      // by pubkey, 0 nonces
      {
        const nonces = await connection.getNonces({ pubkey: testConfig.accountState.pubkey }, 0);
        expect(nonces.length).toEqual(0);
      }

      // by pubkey, 1 nonces
      {
        const nonces = await connection.getNonces({ pubkey: testConfig.accountState.pubkey }, 1);
        expect(nonces.length).toEqual(1);
        expect(nonces[0].toNumber()).toEqual(testConfig.accountState.expectedNonce.toNumber());
      }

      // by pubkey, 2 nonces
      {
        const nonces = await connection.getNonces({ pubkey: testConfig.accountState.pubkey }, 2);
        expect(nonces.length).toEqual(2);
        expect(nonces[0].toNumber()).toEqual(testConfig.accountState.expectedNonce.toNumber());
        expect(nonces[1].toNumber()).toEqual(testConfig.accountState.expectedNonce.toNumber() + 1);
      }

      connection.disconnect();
    });
  });

  describe("postTx", () => {
    it("can post transaction", async () => {
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipientAddress = "0xE137f5264b6B528244E1643a2D570b37660B7F14" as Address;

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipientAddress,
        amount: defaultAmount,
        gasPrice: testConfig.gasPrice,
        gasLimit: testConfig.gasLimit,
        memo: "We \u2665 developers – iov.one",
      };
      const connection = await EthereumConnection.establish(testConfig.base);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(wallet.id, mainIdentity, sendTx, ethereumCodec, nonce);
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
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipientAddress = "0xE137f5264b6B528244E1643a2D570b37660B7F14" as Address;

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipientAddress,
        amount: defaultAmount,
        gasPrice: testConfig.gasPrice,
        gasLimit: testConfig.gasLimit,
        memo: "We \u2665 developers – iov.one",
      };
      const connection = await EthereumConnection.establish(testConfig.base);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(wallet.id, mainIdentity, sendTx, ethereumCodec, nonce);
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

      const connection = await EthereumConnection.establish(testConfig.base);

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: await randomAddress(),
        amount: defaultAmount,
        gasPrice: testConfig.gasPrice,
        gasLimit: {
          quantity: "1",
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        memo: "We \u2665 developers – iov.one",
      };
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(wallet.id, mainIdentity, sendTx, ethereumCodec, nonce);
      await connection
        .postTx(ethereumCodec.bytesToPost(signed))
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(testConfig.expectedErrorMessages.gasLimitTooLow));

      connection.disconnect();
    }, 30_000);

    it("reports error for insufficient funds", async () => {
      pendingWithoutEthereum();

      const connection = await EthereumConnection.establish(testConfig.base);

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
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
        gasPrice: testConfig.gasPrice,
        gasLimit: testConfig.gasLimit,
        memo: "We \u2665 developers – iov.one",
      };
      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(wallet.id, brokeIdentity, sendTx, ethereumCodec, nonce);
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
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: await randomAddress(),
        amount: defaultAmount,
        gasPrice: testConfig.gasPrice,
        gasLimit: testConfig.gasLimit,
        memo: "We \u2665 developers – iov.one",
      };
      const connection = await EthereumConnection.establish(testConfig.base);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(wallet.id, mainIdentity, sendTx, ethereumCodec, nonce);
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
  });

  describe("watchAccount", () => {
    it("can watch an account", done => {
      pendingWithoutEthereum();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base);

        const recipient = await randomAddress();

        // setup watching
        const events = new Array<Account>();
        const subscription = connection.watchAccount({ address: recipient }).subscribe({
          next: event => {
            if (!event) {
              subscription.unsubscribe();
              connection.disconnect();
              done.fail("Received event undefined, which is not expected in Ethereum");
              return;
            }
            events.push(event);

            expect(event.address).toEqual(recipient);
            expect(event.balance.length).toEqual(1);
            expect(event.balance[0].fractionalDigits).toEqual(18);
            expect(event.balance[0].tokenTicker).toEqual("ETH");

            if (events.length === 2) {
              expect(events[0].balance[0].quantity).toEqual("0");
              expect(events[1].balance[0].quantity).toEqual(defaultAmount.quantity);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
        });

        // post transactions
        const wallet = Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
        const mainIdentity = await wallet.createIdentity(testConfig.chainId, HdPaths.ethereum(0));
        const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
        await postTransaction(wallet, mainIdentity, nonce, recipient, connection);
      })().catch(done.fail);
    }, 90_000);
  });

  describe("searchTx", () => {
    it("throws error for invalid transaction hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
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
      const connection = await EthereumConnection.establish(testConfig.base);
      const nonExistingHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as TransactionId;
      const results = await connection.searchTx({ id: nonExistingHash });
      expect(results.length).toEqual(0);
      connection.disconnect();
    });

    it("can search previous posted transaction by hash", async () => {
      pendingWithoutEthereum();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipientAddress = "0xE137f5264b6B528244E1643a2D570b37660B7F14" as Address;

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipientAddress,
        amount: defaultAmount,
        gasPrice: testConfig.gasPrice,
        gasLimit: testConfig.gasLimit,
        memo: `Search tx test ${Math.random()}`,
      };
      const connection = await EthereumConnection.establish(testConfig.base);
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(wallet.id, mainIdentity, sendTx, ethereumCodec, nonce);
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
      expect(transaction.recipient).toEqual(recipientAddress);
      expect(transaction.amount.quantity).toEqual("445500");
      expect(transaction.creator.pubkey).toEqual(mainIdentity.pubkey);
      connection.disconnect();
    }, 30_000);

    // TODO: load ganache with db from github
    xit("can search a transaction by hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
      const storedTxId = "" as TransactionId;
      const results = await connection.searchTx({ id: storedTxId });
      expect(results.length).toEqual(1);
      const result = results[0];
      expect(result.transactionId).toEqual(storedTxId);
      const transaction = result.transaction;
      if (!isSendTransaction(transaction)) {
        throw new Error("Unexpected transaction type");
      }
      expect(transaction.recipient).toEqual("recipient_address");
      expect(transaction.amount.quantity).toEqual("tx_quantity");
    });

    it("can search a transaction by account", async () => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();
      const connection = await EthereumConnection.establish(testConfig.base, {
        scraperApiUrl: testConfig.scraper!.apiUrl,
      });
      const results = await connection.searchTx({ sentFromOrTo: testConfig.scraper!.address });
      expect(results.length).toBeGreaterThan(1);
      connection.disconnect();
    });

    it("can search transactions by account and minHeight/maxHeight", async () => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      const connection = await EthereumConnection.establish(testConfig.base, {
        scraperApiUrl: testConfig.scraper!.apiUrl,
      });

      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
      const mainIdentity = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(0));

      const recipientAddress = await randomAddress();

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: recipientAddress,
        amount: defaultAmount,
        gasPrice: testConfig.gasPrice,
        gasLimit: testConfig.gasLimit,
        memo: `Search tx test ${new Date()}`,
      };
      const nonce = await connection.getNonce({ pubkey: mainIdentity.pubkey });
      const signed = await profile.signTransaction(wallet.id, mainIdentity, sendTx, ethereumCodec, nonce);
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
    }, 50_000);
  });

  describe("listenTx", () => {
    it("can listen to transactions", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, {
          scraperApiUrl: testConfig.scraper!.apiUrl,
        });

        const recipientAddress = await randomAddress();

        // setup listener
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

            if (events.length === 3) {
              // This assumes we get two transactions into one block
              // A == B < C
              expect(events[0].height).toEqual(events[1].height);
              expect(events[2].height).toBeGreaterThan(events[1].height);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
        });

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(1));

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `listenTx() test A ${Math.random()}`,
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `listenTx() test B ${Math.random()}`,
        };

        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `listenTx() test C ${Math.random()}`,
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);

        const signedA = await profile.signTransaction(wallet.id, sender, sendA, ethereumCodec, nonceA);
        const signedB = await profile.signTransaction(wallet.id, sender, sendB, ethereumCodec, nonceB);
        const signedC = await profile.signTransaction(wallet.id, sender, sendC, ethereumCodec, nonceC);
        const bytesToPostA = ethereumCodec.bytesToPost(signedA);
        const bytesToPostB = ethereumCodec.bytesToPost(signedB);
        const bytesToPostC = ethereumCodec.bytesToPost(signedC);

        // Post A and B in parallel
        const [postResultA, postResultB] = await Promise.all([
          connection.postTx(bytesToPostA),
          connection.postTx(bytesToPostB),
        ]);

        // Wait for a block
        await postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info));
        await postResultB.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // Post C
        await connection.postTx(bytesToPostC);
      })().catch(done.fail);
    }, 60_000);
  });

  describe("liveTx", () => {
    it("can listen to transactions by recipient address (transactions in history and updates)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, {
          scraperApiUrl: testConfig.scraper!.apiUrl,
        });

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(1));

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `liveTx() test A ${Math.random()}`,
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `liveTx() test B ${Math.random()}`,
        };

        const sendC: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `liveTx() test C ${Math.random()}`,
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);

        const signedA = await profile.signTransaction(wallet.id, sender, sendA, ethereumCodec, nonceA);
        const signedB = await profile.signTransaction(wallet.id, sender, sendB, ethereumCodec, nonceB);
        const signedC = await profile.signTransaction(wallet.id, sender, sendC, ethereumCodec, nonceC);
        const bytesToPostA = ethereumCodec.bytesToPost(signedA);
        const bytesToPostB = ethereumCodec.bytesToPost(signedB);
        const bytesToPostC = ethereumCodec.bytesToPost(signedC);

        // Post A and B in parallel
        const [postResultA, postResultB] = await Promise.all([
          connection.postTx(bytesToPostA),
          connection.postTx(bytesToPostB),
        ]);

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

            if (events.length === 3) {
              // This assumes we get two transactions into one block
              // A == B < C
              expect(events[0].height).toEqual(events[1].height);
              expect(events[2].height).toBeGreaterThan(events[1].height);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
        });

        // Post C
        await connection.postTx(bytesToPostC);
      })().catch(done.fail);
    }, 60_000);

    it("can listen to transactions by ID (transaction in history)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, {
          scraperApiUrl: testConfig.scraper!.apiUrl,
        });

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(1));

        const recipientAddress = await randomAddress();
        const send: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `liveTx() test ${Math.random()}`,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(wallet.id, sender, send, ethereumCodec, nonce);
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

    it("can listen to transactions by ID (transaction in updates)", done => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();

      (async () => {
        const connection = await EthereumConnection.establish(testConfig.base, {
          scraperApiUrl: testConfig.scraper!.apiUrl,
        });

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(defaultMnemonic));
        const sender = await profile.createIdentity(wallet.id, testConfig.chainId, HdPaths.ethereum(1));

        const send: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultAmount,
          gasPrice: testConfig.gasPrice,
          gasLimit: testConfig.gasLimit,
          memo: `liveTx() test ${Math.random()}`,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(wallet.id, sender, send, ethereumCodec, nonce);
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
      const connection = await EthereumConnection.establish(testConfig.base);
      const blockHeader = await connection.getBlockHeader(0);
      expect(blockHeader.id).toMatch(/^0x[0-9a-f]{64}$/);
      expect(blockHeader.height).toEqual(0);
      expect(blockHeader.transactionCount).toBeGreaterThanOrEqual(0);
      connection.disconnect();
    });

    it("throws error from invalid block number", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(testConfig.base);
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
        const connection = await EthereumConnection.establish(testConfig.base, { wsUrl: testConfig.wsUrl });
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
        const wallet = Secp256k1HdWallet.fromMnemonic(defaultMnemonic);
        const mainIdentity = await wallet.createIdentity(testConfig.chainId, HdPaths.ethereum(0));

        const [nonceA, nonceB] = await connection.getNonces({ pubkey: mainIdentity.pubkey }, 2);
        const recipient = "0xE137f5264b6B528244E1643a2D570b37660B7F14" as Address;
        await postTransaction(wallet, mainIdentity, nonceA, recipient, connection);
        await postTransaction(wallet, mainIdentity, nonceB, recipient, connection);
      })().catch(done.fail);
    }, 45_000);
  });
});
