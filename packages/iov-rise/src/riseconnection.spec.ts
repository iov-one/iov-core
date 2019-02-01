import Long from "long";
import { ReadonlyDate } from "readonly-date";

import {
  Account,
  AccountQuery,
  Address,
  AddressQuery,
  Algorithm,
  Amount,
  BlockInfo,
  ChainId,
  ConfirmedTransaction,
  isBlockInfoPending,
  isConfirmedTransaction,
  isSendTransaction,
  PubkeyQuery,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  TokenTicker,
  TransactionId,
  TransactionState,
} from "@iov/bcp-types";
import { Random } from "@iov/crypto";
import { Derivation } from "@iov/dpos";
import { Encoding } from "@iov/encoding";
import { Ed25519Wallet, UserProfile } from "@iov/keycontrol";

import { pubkeyToAddress } from "./derivation";
import { riseCodec } from "./risecodec";
import { generateNonce, RiseConnection } from "./riseconnection";

const { fromHex } = Encoding;
const riseTestnet = "e90d39ac200c495b97deb6d9700745177c7fc4aa80a404108ec820cbeced054c" as ChainId;

async function randomAddress(): Promise<Address> {
  const pubkey = await Random.getBytes(32);
  return pubkeyToAddress(pubkey);
}

describe("RiseConnection", () => {
  const base = "https://twallet.rise.vision";
  const defaultKeypair = Derivation.passphraseToKeypair(
    "squeeze frog deposit chase sudden clutch fortune spring tone have snow column",
  );
  const defaultRecipientAddress = "123R" as Address; // address with no keypair
  const defaultSendAmount: Amount = {
    quantity: "145500",
    fractionalDigits: 8,
    tokenTicker: "RISE" as TokenTicker,
  };

  it("can be constructed", () => {
    const connection = new RiseConnection(base, riseTestnet);
    expect(connection).toBeTruthy();
  });

  it("takes different kind of API URLs", () => {
    expect(new RiseConnection("http://localhost", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://localhost/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://localhost", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://localhost/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://localhost:456", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://localhost:456/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://localhost:456", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://localhost:456/", riseTestnet)).toBeTruthy();

    expect(new RiseConnection("http://my-HOST.tld", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://my-HOST.tld/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://my-HOST.tld", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://my-HOST.tld/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://my-HOST.tld:456", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://my-HOST.tld:456/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://my-HOST.tld:456", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://my-HOST.tld:456/", riseTestnet)).toBeTruthy();

    expect(new RiseConnection("http://123.123.123.123", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://123.123.123.123/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://123.123.123.123", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://123.123.123.123/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://123.123.123.123:456", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("http://123.123.123.123:456/", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://123.123.123.123:456", riseTestnet)).toBeTruthy();
    expect(new RiseConnection("https://123.123.123.123:456/", riseTestnet)).toBeTruthy();
  });

  it("throws for invalid API URLs", () => {
    // wrong scheme
    expect(() => new RiseConnection("localhost", riseTestnet)).toThrowError(/invalid api url/i);
    expect(() => new RiseConnection("ftp://localhost", riseTestnet)).toThrowError(/invalid api url/i);
    expect(() => new RiseConnection("ws://localhost", riseTestnet)).toThrowError(/invalid api url/i);

    // unsupported hosts
    expect(() => new RiseConnection("http://[2001::0370:7344]/", riseTestnet)).toThrowError(
      /invalid api url/i,
    );
    expect(() => new RiseConnection("http://[2001::0370:7344]:8080/", riseTestnet)).toThrowError(
      /invalid api url/i,
    );

    // wrong path
    expect(() => new RiseConnection("http://localhost/api", riseTestnet)).toThrowError(/invalid api url/i);
  });

  it("can disconnect", () => {
    const connection = new RiseConnection(base, riseTestnet);
    expect(() => connection.disconnect()).not.toThrow();
  });

  it("can get existing ticker", async () => {
    const connection = new RiseConnection(base, riseTestnet);
    const ticker = await connection.getTicker("RISE" as TokenTicker);
    expect(ticker).toBeDefined();
    expect(ticker!.tokenTicker).toEqual("RISE");
    expect(ticker!.tokenName).toEqual("RISE");
  });

  it("produces empty result for non-existing ticker", async () => {
    const connection = new RiseConnection(base, riseTestnet);
    const ticker = await connection.getTicker("ETH" as TokenTicker);
    expect(ticker).toBeUndefined();
  });

  it("can get all tickers", async () => {
    const connection = new RiseConnection(base, riseTestnet);
    const tickers = await connection.getAllTickers();
    expect(tickers.length).toEqual(1);
    expect(tickers[0].tokenTicker).toEqual("RISE");
    expect(tickers[0].tokenName).toEqual("RISE");
  });

  it("can get chain ID", async () => {
    const connection = await RiseConnection.establish(base);
    const chainId = connection.chainId();
    expect(chainId).toEqual(riseTestnet);
  });

  it("can get height", async () => {
    const connection = await RiseConnection.establish(base);
    const height = await connection.height();
    expect(height).toBeGreaterThan(1000000);
    expect(height).toBeLessThan(4000000);
  });

  describe("getAccount", () => {
    it("can get account from address", async () => {
      const connection = await RiseConnection.establish(base);
      const query: AccountQuery = { address: "6472030874529564639R" as Address };
      const response = await connection.getAccount(query);

      const expectedPubkey: PublicKeyBundle = {
        algo: Algorithm.Ed25519,
        data: fromHex("ac681190391fe048d133a60e9b49f7ac0a8b0500b58a9f176b88aee1e79fe735") as PublicKeyBytes,
      };
      expect(response!.address).toEqual("6472030874529564639R");
      expect(response!.pubkey).toEqual(expectedPubkey);
      expect(response!.balance[0].tokenTicker).toEqual("RISE");
      expect(response!.balance[0].fractionalDigits).toEqual(8);
      expect(response!.balance[0].quantity).toEqual("5298643212");
    });

    it("can get account from pubkey", async () => {
      const connection = await RiseConnection.establish(base);
      const pubkey: PublicKeyBundle = {
        algo: Algorithm.Ed25519,
        data: fromHex("ac681190391fe048d133a60e9b49f7ac0a8b0500b58a9f176b88aee1e79fe735") as PublicKeyBytes,
      };
      const query: AccountQuery = { pubkey: pubkey };
      const response = await connection.getAccount(query);

      const expectedPubkey = pubkey;
      expect(response!.address).toEqual("6472030874529564639R");
      expect(response!.pubkey).toEqual(expectedPubkey);
      expect(response!.balance[0].tokenTicker).toEqual("RISE");
      expect(response!.balance[0].fractionalDigits).toEqual(8);
      expect(response!.balance[0].quantity).toEqual("5298643212");
    });

    it("returns undefined pubkey for account with no outgoing transactions", async () => {
      const connection = await RiseConnection.establish(base);
      const response = await connection.getAccount({ address: defaultRecipientAddress });
      expect(response!.address).toEqual(defaultRecipientAddress);
      expect(response!.pubkey).toBeUndefined();
    });

    it("returns empty list when getting an unused account", async () => {
      const unusedAddress = "5648777643193648871R" as Address;
      const connection = await RiseConnection.establish(base);
      const response = await connection.getAccount({ address: unusedAddress });
      expect(response).toBeUndefined();
    });
  });

  describe("getNonce", () => {
    it("can get nonce", async () => {
      const connection = await RiseConnection.establish(base);

      // by address
      {
        const query: AddressQuery = { address: "5399275477602875017R" as Address };
        const nonce = await connection.getNonce(query);
        // nonce is current unix timestamp +/- 300ms
        expect(nonce.toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonce.toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      // by pubkey
      {
        const query: PubkeyQuery = {
          pubkey: {
            algo: Algorithm.Ed25519,
            data: fromHex(
              "ac681190391fe048d133a60e9b49f7ac0a8b0500b58a9f176b88aee1e79fe735",
            ) as PublicKeyBytes,
          },
        };
        const nonce = await connection.getNonce(query);
        // nonce is current unix timestamp +/- 300ms
        expect(nonce.toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonce.toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      connection.disconnect();
    });
  });

  describe("getNonces", () => {
    it("can get 0/1/2/3 nonces", async () => {
      const connection = await RiseConnection.establish(base);

      const addressQuery: AddressQuery = { address: "5399275477602875017R" as Address };
      const pubkeyQuery: PubkeyQuery = {
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("ac681190391fe048d133a60e9b49f7ac0a8b0500b58a9f176b88aee1e79fe735") as PublicKeyBytes,
        },
      };

      // by address, 0 nonces
      {
        const nonces = await connection.getNonces(addressQuery, 0);
        expect(nonces.length).toEqual(0);
      }

      // by address, 1 nonces
      {
        const nonces = await connection.getNonces(addressQuery, 1);
        expect(nonces.length).toEqual(1);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[0].toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[0].toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      // by address, 2 nonces
      {
        const nonces = await connection.getNonces(addressQuery, 2);
        expect(nonces.length).toEqual(2);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[1].toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[1].toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[0].toNumber()).toEqual(nonces[1].toNumber() - 1);
      }

      // by address, 3 nonces
      {
        const nonces = await connection.getNonces(addressQuery, 3);
        expect(nonces.length).toEqual(3);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[2].toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[2].toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[1].toNumber()).toEqual(nonces[2].toNumber() - 1);
        expect(nonces[0].toNumber()).toEqual(nonces[1].toNumber() - 1);
      }

      // by pubkey, 0 nonces
      {
        const nonces = await connection.getNonces(pubkeyQuery, 0);
        expect(nonces.length).toEqual(0);
      }

      // by pubkey, 1 nonces
      {
        const nonces = await connection.getNonces(pubkeyQuery, 1);
        expect(nonces.length).toEqual(1);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[0].toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[0].toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      // by pubkey, 2 nonces
      {
        const nonces = await connection.getNonces(pubkeyQuery, 2);
        expect(nonces.length).toEqual(2);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[1].toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[1].toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[0].toNumber()).toEqual(nonces[1].toNumber() - 1);
      }

      // by pubkey, 3 nonces
      {
        const nonces = await connection.getNonces(pubkeyQuery, 3);
        expect(nonces.length).toEqual(3);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[2].toNumber()).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[2].toNumber()).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[1].toNumber()).toEqual(nonces[2].toNumber() - 1);
        expect(nonces[0].toNumber()).toEqual(nonces[1].toNumber() - 1);
      }

      connection.disconnect();
    });
  });

  describe("watchAccount", () => {
    it("can watch account by address", done => {
      (async () => {
        const connection = await RiseConnection.establish(base);

        const recipient = await randomAddress();

        const events = new Array<Account | undefined>();
        const subscription = connection.watchAccount({ address: recipient }).subscribe({
          next: event => {
            events.push(event);

            if (events.length === 3) {
              const [event1, event2, event3] = events;

              expect(event1).toBeUndefined();

              if (!event2) {
                throw new Error("Second event must not be undefined");
              }
              expect(event2.address).toEqual(recipient);
              expect(event2.pubkey).toBeUndefined();
              expect(event2.balance.length).toEqual(1);
              expect(event2.balance[0].quantity).toEqual(defaultSendAmount.quantity);
              expect(event2.balance[0].tokenTicker).toEqual(defaultSendAmount.tokenTicker);

              if (!event3) {
                throw new Error("Second event must not be undefined");
              }
              expect(event3.address).toEqual(recipient);
              expect(event3.pubkey).toBeUndefined();
              expect(event3.balance.length).toEqual(1);
              expect(event3.balance[0].quantity).toEqual(
                Long.fromString(defaultSendAmount.quantity)
                  .multiply(2)
                  .toString(),
              );
              expect(event3.balance[0].tokenTicker).toEqual(defaultSendAmount.tokenTicker);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
          complete: done.fail,
          error: done.fail,
        });

        const wallet = new Ed25519Wallet();
        const mainIdentity = await wallet.createIdentity(riseTestnet, await defaultKeypair);

        for (const _ of [0, 1]) {
          const sendTx: SendTransaction = {
            kind: "bcp/send",
            creator: mainIdentity,
            recipient: recipient,
            amount: defaultSendAmount,
          };

          const nonce = generateNonce();
          const signingJob = riseCodec.bytesToSign(sendTx, nonce);
          const signature = await wallet.createTransactionSignature(
            mainIdentity,
            signingJob.bytes,
            signingJob.prehashType,
          );

          const signedTransaction: SignedTransaction = {
            transaction: sendTx,
            primarySignature: {
              nonce: nonce,
              pubkey: mainIdentity.pubkey,
              signature: signature,
            },
            otherSignatures: [],
          };

          const result = await connection.postTx(riseCodec.bytesToPost(signedTransaction));
          await result.blockInfo.waitFor(info => !isBlockInfoPending(info));
        }
      })().catch(done.fail);
    }, 90_000);
  });

  describe("getBlockHeader", () => {
    it("throws for invalid height arguments", async () => {
      const connection = await RiseConnection.establish(base);

      // not an integer
      await connection
        .getBlockHeader(NaN)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/height must be a non-negative safe integer/i));
      await connection
        .getBlockHeader(NaN)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/height must be a non-negative safe integer/i));
      await connection
        .getBlockHeader(1.1)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/height must be a non-negative safe integer/i));
      await connection
        .getBlockHeader(Number.POSITIVE_INFINITY)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/height must be a non-negative safe integer/i));

      // out of range
      await connection
        .getBlockHeader(Number.MAX_SAFE_INTEGER + 1)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/height must be a non-negative safe integer/i));

      // negative
      await connection
        .getBlockHeader(-1)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/height must be a non-negative safe integer/i));

      connection.disconnect();
    });

    it("can get genesis", async () => {
      const connection = await RiseConnection.establish(base);

      // https://github.com/RiseVision/rise-node/blob/v1.3.2/etc/testnet/genesisBlock.json
      const header = await connection.getBlockHeader(1);
      expect(header.id).toEqual("15399938159765211302");
      expect(header.height).toEqual(1);
      expect(header.time).toEqual(new ReadonlyDate(1464109200 /* lisk epoch as unix timestamp */ * 1000));
      expect(header.transactionCount).toEqual(303);

      connection.disconnect();
    });

    it("rejects for non-existing block", async () => {
      const connection = await RiseConnection.establish(base);

      await connection
        .getBlockHeader(20_000_000)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/block does not exist/i));

      connection.disconnect();
    });
  });

  describe("postTx", () => {
    it("can post transaction", async () => {
      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(riseTestnet, await defaultKeypair);

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: defaultRecipientAddress,
        amount: defaultSendAmount,
      };

      // Encode creation timestamp into nonce
      const nonce = generateNonce();
      const signingJob = riseCodec.bytesToSign(sendTx, nonce);
      const signature = await wallet.createTransactionSignature(
        mainIdentity,
        signingJob.bytes,
        signingJob.prehashType,
      );

      const signedTransaction: SignedTransaction = {
        transaction: sendTx,
        primarySignature: {
          nonce: nonce,
          pubkey: mainIdentity.pubkey,
          signature: signature,
        },
        otherSignatures: [],
      };
      const bytesToPost = riseCodec.bytesToPost(signedTransaction);

      const connection = await RiseConnection.establish(base);
      const result = await connection.postTx(bytesToPost);
      expect(result).toBeTruthy();
    });

    xit("can post transaction and watch confirmations", done => {
      (async () => {
        const wallet = new Ed25519Wallet();
        const mainIdentity = await wallet.createIdentity(riseTestnet, await defaultKeypair);

        const sendTx: SendTransaction = {
          kind: "bcp/send",
          creator: mainIdentity,
          recipient: defaultRecipientAddress,
          amount: defaultSendAmount,
        };

        // Encode creation timestamp into nonce
        const nonce = generateNonce();
        const signingJob = riseCodec.bytesToSign(sendTx, nonce);
        const signature = await wallet.createTransactionSignature(
          mainIdentity,
          signingJob.bytes,
          signingJob.prehashType,
        );

        const signedTransaction: SignedTransaction = {
          transaction: sendTx,
          primarySignature: {
            nonce: nonce,
            pubkey: mainIdentity.pubkey,
            signature: signature,
          },
          otherSignatures: [],
        };
        const bytesToPost = riseCodec.bytesToPost(signedTransaction);

        const connection = await RiseConnection.establish(base);
        const heightBeforeTransaction = await connection.height();
        const result = await connection.postTx(bytesToPost);
        expect(result).toBeTruthy();
        expect(result.blockInfo.value.state).toEqual(TransactionState.Pending);

        const events = new Array<BlockInfo>();
        const subscription = result.blockInfo.updates.subscribe({
          next: info => {
            events.push(info);

            if (events.length === 2) {
              expect(events[0]).toEqual({ state: TransactionState.Pending });
              expect(events[1]).toEqual({
                state: TransactionState.Succeeded,
                height: heightBeforeTransaction + 1,
                confirmations: 1,
              });
              subscription.unsubscribe();
              done();
            }
          },
          complete: fail,
          error: fail,
        });
      })().catch(fail);
    }, 80_000);

    it("throws for transaction with corrupted signature", async () => {
      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(riseTestnet, await defaultKeypair);

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: defaultRecipientAddress,
        amount: defaultSendAmount,
      };

      // Encode creation timestamp into nonce
      const nonce = generateNonce();
      const signingJob = riseCodec.bytesToSign(sendTx, nonce);
      const signature = await wallet.createTransactionSignature(
        mainIdentity,
        signingJob.bytes,
        signingJob.prehashType,
      );

      // tslint:disable-next-line:no-bitwise
      const corruptedSignature = signature.map((x, i) => (i === 0 ? x ^ 0x01 : x)) as SignatureBytes;

      const signedTransaction: SignedTransaction = {
        transaction: sendTx,
        primarySignature: {
          nonce: nonce,
          pubkey: mainIdentity.pubkey,
          signature: corruptedSignature,
        },
        otherSignatures: [],
      };
      const bytesToPost = riseCodec.bytesToPost(signedTransaction);

      const connection = await RiseConnection.establish(base);
      await connection
        .postTx(bytesToPost)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/Failed to verify signature/i));
    });
  });

  describe("searchTx", () => {
    it("can search transactions by ID", async () => {
      const connection = await RiseConnection.establish(base);

      // by non-existing ID
      {
        const searchId = "98568736528934587" as TransactionId;
        const results = await connection.searchTx({ id: searchId });
        expect(results.length).toEqual(0);
      }

      // by existing ID (https://texplorer.rise.vision/tx/530955287567640950)
      {
        const searchId = "530955287567640950" as TransactionId;
        const results = await connection.searchTx({ id: searchId });
        expect(results.length).toEqual(1);
        const result = results[0];
        expect(result.height).toEqual(1156579);
        expect(result.transactionId).toEqual(searchId);
        const transaction = result.transaction;
        if (!isSendTransaction(transaction)) {
          throw new Error("Unexpected transaction type");
        }
        expect(transaction.recipient).toEqual("10145108642177909005R");
        expect(transaction.amount.quantity).toEqual("14550000");
      }

      connection.disconnect();
    });

    it("can search transactions by address", async () => {
      const connection = await RiseConnection.establish(base);

      // by non-existing address
      {
        const unusedAddress = await randomAddress();
        const results = await connection.searchTx({ sentFromOrTo: unusedAddress });
        expect(results.length).toEqual(0);
      }

      // by recipient address (https://texplorer.rise.vision/address/123R)
      {
        const searchAddress = "123R" as Address;
        const results = await connection.searchTx({ sentFromOrTo: searchAddress });
        expect(results.length).toBeGreaterThanOrEqual(874);
        for (const result of results) {
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(transaction.recipient === searchAddress).toEqual(true);
        }
      }

      // by sender address (https://texplorer.rise.vision/address/13640984096060415228R)
      {
        const searchAddress = "13640984096060415228R" as Address;
        const results = await connection.searchTx({ sentFromOrTo: searchAddress });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(
            transaction.recipient === searchAddress ||
              riseCodec.identityToAddress(transaction.creator) === searchAddress,
          ).toEqual(true);
        }
      }

      // by sender address with vote transaction (https://texplorer.rise.vision/address/471759806304061958R)
      {
        const searchAddress = "471759806304061958R" as Address;
        const results = await connection.searchTx({ sentFromOrTo: searchAddress });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(
            transaction.recipient === searchAddress ||
              riseCodec.identityToAddress(transaction.creator) === searchAddress,
          ).toEqual(true);
        }
      }

      connection.disconnect();
    }, 60_000);
  });

  describe("liveTx", () => {
    it("can listen to transactions by recipient address (transactions in history and updates)", done => {
      (async () => {
        const connection = await RiseConnection.establish(base);

        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const sender = await profile.createIdentity(wallet.id, riseTestnet, await defaultKeypair);

        const recipientAddress = await randomAddress();

        const sendA: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultSendAmount,
        };

        const sendB: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultSendAmount,
        };

        const [nonceA, nonceB] = await connection.getNonces({ pubkey: sender.pubkey }, 2);
        const signedA = await profile.signTransaction(wallet.id, sender, sendA, riseCodec, nonceA);
        const signedB = await profile.signTransaction(wallet.id, sender, sendB, riseCodec, nonceB);
        const bytesToPostA = riseCodec.bytesToPost(signedA);
        const bytesToPostB = riseCodec.bytesToPost(signedB);

        // Post A and wait for block
        const postResultA = await connection.postTx(bytesToPostA);
        await postResultA.blockInfo.waitFor(info => !isBlockInfoPending(info));

        // setup listener after A and B are in block
        const events = new Array<ConfirmedTransaction<SendTransaction>>();
        const subscription = connection.liveTx({ sentFromOrTo: recipientAddress }).subscribe({
          next: event => {
            if (!isConfirmedTransaction(event)) {
              throw new Error("Confirmed transaction expected");
            }
            if (!isSendTransaction(event.transaction)) {
              throw new Error("Unexpected transaction type");
            }
            events.push(event as ConfirmedTransaction<SendTransaction>);

            if (events.length === 2) {
              // from this test
              expect(event.transaction.recipient).toEqual(recipientAddress);

              // correct order
              expect(events[0].primarySignature.nonce.toNumber()).toEqual(nonceA.toNumber());
              expect(events[1].primarySignature.nonce.toNumber()).toEqual(nonceB.toNumber());

              // in different blocks
              expect(events[1].height).toBeGreaterThan(events[0].height);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
        });

        // Post B
        await connection.postTx(bytesToPostB);
      })().catch(done.fail);
    }, 90_000);

    it("can listen to transactions by ID (transaction in history)", done => {
      (async () => {
        const connection = await RiseConnection.establish(base);

        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const sender = await profile.createIdentity(wallet.id, riseTestnet, await defaultKeypair);

        const recipientAddress = await randomAddress();
        const send: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultSendAmount,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(wallet.id, sender, send, riseCodec, nonce);
        const bytesToPost = riseCodec.bytesToPost(signed);

        const postResult = await connection.postTx(bytesToPost);
        const transactionId = postResult.transactionId;

        // Wait for a block
        await postResult.blockInfo.waitFor(info => info.state !== TransactionState.Pending);

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
    }, 60_000);

    it("can listen to transactions by ID (transaction in updates)", done => {
      (async () => {
        const connection = await RiseConnection.establish(base);

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const sender = await profile.createIdentity(wallet.id, riseTestnet, await defaultKeypair);

        const send: SendTransaction = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: defaultSendAmount,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(wallet.id, sender, send, riseCodec, nonce);
        const bytesToPost = riseCodec.bytesToPost(signed);

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
    }, 60_000);
  });
});
