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
  Nonce,
  PubkeyQuery,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  TokenTicker,
  TransactionId,
  TransactionState,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Random } from "@iov/crypto";
import { Derivation } from "@iov/dpos";
import { Encoding } from "@iov/encoding";
import { Ed25519Wallet, UserProfile } from "@iov/keycontrol";
import { toListPromise } from "@iov/stream";

import { pubkeyToAddress } from "./derivation";
import { liskCodec } from "./liskcodec";
import { generateNonce, LiskConnection } from "./liskconnection";

const { fromHex } = Encoding;
const blockTime = 10_000;

function pendingWithoutLiskDevnet(): void {
  if (!process.env.LISK_ENABLED) {
    pending("Set LISK_ENABLED to enable Lisk network tests");
  }
}

async function randomAddress(): Promise<Address> {
  const pubkey = await Random.getBytes(32);
  return pubkeyToAddress(pubkey);
}

describe("LiskConnection", () => {
  // a network that does not exist used for non-networking tests
  const dummynetBase = "https://my-host.tld:12345";
  const dummynetChainId = "f0b96e79655665abbe95b7a7f626036eb20244ead279e5f972e87cbfd77daa09" as ChainId;
  // a local devnet
  const devnetBase = "http://localhost:4000";
  const devnetChainId = "198f2b61a8eb95fbeed58b8216780b68f697f26b849acf00c8c93bb9b24f783d" as ChainId;
  const devnetDefaultRecipient = "2222222L" as Address; // random address with no keypair
  const devnetDefaultKeypair = Derivation.passphraseToKeypair(
    "wagon stock borrow episode laundry kitten salute link globe zero feed marble",
  );
  const devnetDefaultAmount: Amount = {
    quantity: "144550000",
    fractionalDigits: 8,
    tokenTicker: "LSK" as TokenTicker,
  };

  it("can be constructed", () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    expect(connection).toBeTruthy();
  });

  it("takes different kind of API URLs", () => {
    expect(new LiskConnection("http://localhost", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://localhost/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://localhost:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://localhost:456/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://localhost:456/", dummynetChainId)).toBeTruthy();

    expect(new LiskConnection("http://my-HOST.tld", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://my-HOST.tld/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://my-HOST.tld:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://my-HOST.tld:456/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://my-HOST.tld:456/", dummynetChainId)).toBeTruthy();

    expect(new LiskConnection("http://123.123.123.123", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://123.123.123.123/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://123.123.123.123:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("http://123.123.123.123:456/", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123:456", dummynetChainId)).toBeTruthy();
    expect(new LiskConnection("https://123.123.123.123:456/", dummynetChainId)).toBeTruthy();
  });

  it("throws for invalid API URLs", () => {
    // wrong scheme
    expect(() => new LiskConnection("localhost", dummynetChainId)).toThrowError(/invalid api url/i);
    expect(() => new LiskConnection("ftp://localhost", dummynetChainId)).toThrowError(/invalid api url/i);
    expect(() => new LiskConnection("ws://localhost", dummynetChainId)).toThrowError(/invalid api url/i);

    // unsupported hosts
    expect(() => new LiskConnection("http://[2001::0370:7344]/", dummynetChainId)).toThrowError(
      /invalid api url/i,
    );
    expect(() => new LiskConnection("http://[2001::0370:7344]:8080/", dummynetChainId)).toThrowError(
      /invalid api url/i,
    );

    // wrong path
    expect(() => new LiskConnection("http://localhost/api", dummynetChainId)).toThrowError(
      /invalid api url/i,
    );
  });

  it("can disconnect", () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    expect(() => connection.disconnect()).not.toThrow();
  });

  describe("getToken", () => {
    it("can get existing tokens", async () => {
      const connection = new LiskConnection(dummynetBase, dummynetChainId);
      const token = await connection.getToken("LSK" as TokenTicker);
      expect(token).toEqual({
        tokenTicker: "LSK" as TokenTicker,
        tokenName: "Lisk",
        fractionalDigits: 8,
      });
      connection.disconnect();
    });

    it("produces empty result for non-existing tokens", async () => {
      const connection = new LiskConnection(dummynetBase, dummynetChainId);
      const token = await connection.getToken("ETH" as TokenTicker);
      expect(token).toBeUndefined();
      connection.disconnect();
    });
  });

  describe("getAllTokens", () => {
    it("can get all tokens", async () => {
      const connection = new LiskConnection(dummynetBase, dummynetChainId);
      const tokens = await connection.getAllTokens();
      expect(tokens.length).toEqual(1);
      expect(tokens[0]).toEqual({
        tokenTicker: "LSK" as TokenTicker,
        tokenName: "Lisk",
        fractionalDigits: 8,
      });
      connection.disconnect();
    });
  });

  it("can get chain ID", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const chainId = connection.chainId();
    expect(chainId).toEqual(devnetChainId);
  });

  it("can get height", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const height = await connection.height();
    expect(height).toBeGreaterThan(0);
    expect(height).toBeLessThan(10000000);
  });

  describe("getAccount", () => {
    it("can get account from address", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);
      const query: AccountQuery = { address: "1349293588603668134L" as Address };
      const account = await connection.getAccount(query);

      const expectedPubkey: PublicKeyBundle = {
        algo: Algorithm.Ed25519,
        data: fromHex("e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6") as PublicKeyBytes,
      };
      expect(account!.address).toEqual("1349293588603668134L");
      expect(account!.pubkey).toEqual(expectedPubkey);
      expect(account!.balance[0].tokenTicker).toEqual("LSK");
      expect(account!.balance[0].fractionalDigits).toEqual(8);
      expect(account!.balance[0].quantity).toEqual("10034556677");
    });

    it("can get account from pubkey", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);
      const pubkey: PublicKeyBundle = {
        algo: Algorithm.Ed25519,
        data: fromHex("e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6") as PublicKeyBytes,
      };
      const query: AccountQuery = { pubkey: pubkey };
      const account = await connection.getAccount(query);

      const expectedPubkey = pubkey;
      expect(account!.address).toEqual("1349293588603668134L");
      expect(account!.pubkey).toEqual(expectedPubkey);
      expect(account!.balance[0].tokenTicker).toEqual("LSK");
      expect(account!.balance[0].fractionalDigits).toEqual(8);
      expect(account!.balance[0].quantity).toEqual("10034556677");
    });

    it("returns empty list when getting an unused account", async () => {
      pendingWithoutLiskDevnet();
      const unusedAddress = "5648777643193648871L" as Address;
      const connection = await LiskConnection.establish(devnetBase);
      const response = await connection.getAccount({ address: unusedAddress });
      expect(response).toBeUndefined();
    });

    it("returns undefined pubkey for receive only address", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);
      const response = await connection.getAccount({ address: devnetDefaultRecipient });
      expect(response!.address).toEqual(devnetDefaultRecipient);
      expect(response!.pubkey).toBeUndefined();
    });
  });

  describe("getNonce", () => {
    it("can get nonce", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      // by address
      {
        const query: AddressQuery = { address: "6472030874529564639L" as Address };
        const nonce = await connection.getNonce(query);
        // nonce is current unix timestamp +/- 300ms
        expect(nonce).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonce).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      // by pubkey
      {
        const query: PubkeyQuery = {
          pubkey: {
            algo: Algorithm.Ed25519,
            data: fromHex(
              "e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6",
            ) as PublicKeyBytes,
          },
        };
        const nonce = await connection.getNonce(query);
        // nonce is current unix timestamp +/- 300ms
        expect(nonce).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonce).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      connection.disconnect();
    });
  });

  describe("getNonces", () => {
    it("can get 0/1/2/3 nonces", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      const addressQuery: AddressQuery = { address: "6472030874529564639L" as Address };
      const pubkeyQuery: PubkeyQuery = {
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6") as PublicKeyBytes,
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
        // nonce is current unix timestamp +/- 300ms
        expect(nonces[0]).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[0]).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      // by address, 2 nonces
      {
        const nonces = await connection.getNonces(addressQuery, 2);
        expect(nonces.length).toEqual(2);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[1]).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[1]).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[0]).toEqual((nonces[1] - 1) as Nonce);
      }

      // by address, 3 nonces
      {
        const nonces = await connection.getNonces(addressQuery, 3);
        expect(nonces.length).toEqual(3);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[2]).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[2]).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[1]).toEqual((nonces[2] - 1) as Nonce);
        expect(nonces[0]).toEqual((nonces[1] - 1) as Nonce);
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
        // nonce is current unix timestamp +/- 300ms
        expect(nonces[0]).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[0]).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
      }

      // by pubkey, 2 nonces
      {
        const nonces = await connection.getNonces(pubkeyQuery, 2);
        expect(nonces.length).toEqual(2);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[1]).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[1]).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[0]).toEqual((nonces[1] - 1) as Nonce);
      }

      // by pubkey, 3 nonces
      {
        const nonces = await connection.getNonces(pubkeyQuery, 3);
        expect(nonces.length).toEqual(3);
        // last nonce is current unix timestamp +/- 300ms
        expect(nonces[2]).toBeGreaterThanOrEqual(Math.floor(Date.now() / 1000 - 0.3));
        expect(nonces[2]).toBeLessThanOrEqual(Math.floor(Date.now() / 1000 + 0.3));
        expect(nonces[1]).toEqual((nonces[2] - 1) as Nonce);
        expect(nonces[0]).toEqual((nonces[1] - 1) as Nonce);
      }

      connection.disconnect();
    });
  });

  describe("watchAccount", () => {
    it("can watch account by address", done => {
      pendingWithoutLiskDevnet();

      (async () => {
        const connection = await LiskConnection.establish(devnetBase);

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
              expect(event2.balance[0].quantity).toEqual(devnetDefaultAmount.quantity);
              expect(event2.balance[0].tokenTicker).toEqual(devnetDefaultAmount.tokenTicker);

              if (!event3) {
                throw new Error("Second event must not be undefined");
              }
              expect(event3.address).toEqual(recipient);
              expect(event3.pubkey).toBeUndefined();
              expect(event3.balance.length).toEqual(1);
              expect(event3.balance[0].quantity).toEqual(
                Long.fromString(devnetDefaultAmount.quantity)
                  .multiply(2)
                  .toString(),
              );
              expect(event3.balance[0].tokenTicker).toEqual(devnetDefaultAmount.tokenTicker);

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
          complete: done.fail,
          error: done.fail,
        });

        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const mainIdentity = await profile.createIdentity(
          wallet.id,
          dummynetChainId,
          await devnetDefaultKeypair,
        );

        for (const _ of [0, 1]) {
          const sendTx: SendTransaction & WithCreator = {
            kind: "bcp/send",
            creator: mainIdentity,
            recipient: recipient,
            amount: devnetDefaultAmount,
          };

          const signedTransaction = await profile.signTransaction(sendTx, liskCodec, generateNonce());

          const result = await connection.postTx(liskCodec.bytesToPost(signedTransaction));
          await result.blockInfo.waitFor(info => !isBlockInfoPending(info));
        }
      })().catch(done.fail);
    }, 30_000);
  });

  describe("getBlockHeader", () => {
    it("throws for invalid height arguments", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

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
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      const header = await connection.getBlockHeader(1);
      expect(header.id).toEqual("6524861224470851795");
      expect(header.height).toEqual(1);
      expect(header.time).toEqual(new ReadonlyDate(1464109200 /* lisk epoch as unix timestamp */ * 1000));
      expect(header.transactionCount).toEqual(103);

      connection.disconnect();
    });

    it("rejects for non-existing block", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      await connection
        .getBlockHeader(20_000_000)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/block does not exist/i));

      connection.disconnect();
    });
  });

  describe("watchBlockHeaders", () => {
    it("watches headers with same data as getBlockHeader", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      const headers = await toListPromise(connection.watchBlockHeaders(), 2);

      const lastHeight = headers[headers.length - 1].height;
      const headerFromGet = await connection.getBlockHeader(lastHeight);

      // first header
      expect(headers[0].height).toEqual(headerFromGet.height - 1);
      expect(headers[0].id).not.toEqual(headerFromGet.id);
      expect(headers[0].transactionCount).toBeGreaterThanOrEqual(0);
      expect(headers[0].time.getTime()).toBeGreaterThan(headerFromGet.time.getTime() - blockTime - 200);
      expect(headers[0].time.getTime()).toBeLessThan(headerFromGet.time.getTime() - blockTime + 200);

      // second header
      expect(headers[1].height).toEqual(headerFromGet.height);
      expect(headers[1].id).toEqual(headerFromGet.id);
      expect(headers[1].transactionCount).toEqual(headerFromGet.transactionCount);
      expect(headers[1].time).toEqual(headerFromGet.time);
    });
  });

  describe("postTx", () => {
    it("can post transaction", async () => {
      pendingWithoutLiskDevnet();

      const profile = new UserProfile();
      const wallet = profile.addWallet(new Ed25519Wallet());
      const mainIdentity = await profile.createIdentity(wallet.id, devnetChainId, await devnetDefaultKeypair);

      const sendTx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: devnetDefaultRecipient,
        memo: `We ❤️ developers – iov.one ${Math.random()}`,
        amount: devnetDefaultAmount,
      };

      const signedTransaction = await profile.signTransaction(sendTx, liskCodec, generateNonce());
      const bytesToPost = liskCodec.bytesToPost(signedTransaction);

      const connection = await LiskConnection.establish(devnetBase);
      const result = await connection.postTx(bytesToPost);
      expect(result).toBeTruthy();
    });

    it("can post transaction and watch confirmations", done => {
      pendingWithoutLiskDevnet();

      (async () => {
        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const mainIdentity = await profile.createIdentity(
          wallet.id,
          devnetChainId,
          await devnetDefaultKeypair,
        );

        const sendTx: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: mainIdentity,
          recipient: devnetDefaultRecipient,
          memo: `We ❤️ developers – iov.one ${Math.random()}`,
          amount: devnetDefaultAmount,
        };

        const signedTransaction = await profile.signTransaction(sendTx, liskCodec, generateNonce());
        const bytesToPost = liskCodec.bytesToPost(signedTransaction);

        const connection = await LiskConnection.establish(devnetBase);
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
    }, 30000);

    xit("can post transaction and wait for 4 confirmations", async () => {
      pendingWithoutLiskDevnet();

      const profile = new UserProfile();
      const wallet = profile.addWallet(new Ed25519Wallet());
      const mainIdentity = await profile.createIdentity(wallet.id, devnetChainId, await devnetDefaultKeypair);

      const sendTx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: devnetDefaultRecipient,
        memo: `We ❤️ developers – iov.one ${Math.random()}`,
        amount: devnetDefaultAmount,
      };

      const signedTransaction = await profile.signTransaction(sendTx, liskCodec, generateNonce());
      const bytesToPost = liskCodec.bytesToPost(signedTransaction);

      const connection = await LiskConnection.establish(devnetBase);
      const heightBeforeTransaction = await connection.height();
      const result = await connection.postTx(bytesToPost);
      await result.blockInfo.waitFor(
        info => info.state === TransactionState.Succeeded && info.confirmations === 4,
      );

      expect(result.blockInfo.value).toEqual({
        state: TransactionState.Succeeded,
        height: heightBeforeTransaction + 1,
        confirmations: 4,
      });
    }, 60000);

    it("throws for invalid transaction", async () => {
      pendingWithoutLiskDevnet();

      const profile = new UserProfile();
      const wallet = profile.addWallet(new Ed25519Wallet());
      const mainIdentity = await profile.createIdentity(wallet.id, devnetChainId, await devnetDefaultKeypair);

      const sendTx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: mainIdentity,
        recipient: devnetDefaultRecipient,
        memo: "We ❤️ developers – iov.one",
        amount: devnetDefaultAmount,
      };

      // Encode creation timestamp into nonce
      const signedTransaction = await profile.signTransaction(sendTx, liskCodec, generateNonce());

      const corruptedSignature = signedTransaction.primarySignature.signature.map((x, i) =>
        // tslint:disable-next-line:no-bitwise
        i === 0 ? x ^ 0x01 : x,
      ) as SignatureBytes;

      const corruptedSignedTransaction: SignedTransaction = {
        transaction: signedTransaction.transaction,
        primarySignature: {
          ...signedTransaction.primarySignature,
          signature: corruptedSignature,
        },
        otherSignatures: [],
      };
      const bytesToPost = liskCodec.bytesToPost(corruptedSignedTransaction);

      const connection = await LiskConnection.establish(devnetBase);
      await connection
        .postTx(bytesToPost)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/failed with status code 409/i));
    });
  });

  describe("searchTx", () => {
    it("can search transactions by ID", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      // by non-existing ID
      {
        const searchId = "98568736528934587" as TransactionId;
        const results = await connection.searchTx({ id: searchId });
        expect(results.length).toEqual(0);
      }

      // by existing ID (from lisk/init.sh)
      {
        const searchId = "12493173350733478622" as TransactionId;
        const results = await connection.searchTx({ id: searchId });
        expect(results.length).toEqual(1);
        const result = results[0];
        expect(result.height).toBeGreaterThanOrEqual(2);
        expect(result.height).toBeLessThan(100);
        expect(result.transactionId).toEqual(searchId);
        const transaction = result.transaction;
        if (!isSendTransaction(transaction)) {
          throw new Error("Unexpected transaction type");
        }
        expect(transaction.recipient).toEqual("1349293588603668134L");
        expect(transaction.amount.quantity).toEqual("10044556677");
      }

      connection.disconnect();
    });

    it("can search transactions by address", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      // by non-existing address
      {
        const unusedAddress = await randomAddress();
        const results = await connection.searchTx({ sentFromOrTo: unusedAddress });
        expect(results.length).toEqual(0);
      }

      // by recipient address (from lisk/init.sh)
      {
        const searchAddress = "1349293588603668134L" as Address;
        const results = await connection.searchTx({ sentFromOrTo: searchAddress });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(
            transaction.recipient === searchAddress ||
              liskCodec.identityToAddress(transaction.creator) === searchAddress,
          ).toEqual(true);
        }
      }

      // by sender address (from lisk/init.sh)
      {
        const searchAddress = "16313739661670634666L" as Address;
        const results = await connection.searchTx({ sentFromOrTo: searchAddress });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(
            transaction.recipient === searchAddress ||
              liskCodec.identityToAddress(transaction.creator) === searchAddress,
          ).toEqual(true);
        }
      }

      connection.disconnect();
    });

    it("can search transactions by address and minHeight/maxHeight", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      // by recipient address (from lisk/init.sh)
      const searchAddress = "1349293588603668134L" as Address;

      // minHeight = 2
      {
        const results = await connection.searchTx({ sentFromOrTo: searchAddress, minHeight: 2 });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          expect(result.height).toBeGreaterThanOrEqual(2);
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(
            transaction.recipient === searchAddress ||
              liskCodec.identityToAddress(transaction.creator) === searchAddress,
          ).toEqual(true);
        }
      }

      // maxHeight = 100
      {
        const results = await connection.searchTx({ sentFromOrTo: searchAddress, maxHeight: 100 });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          expect(result.height).toBeLessThanOrEqual(100);
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(
            transaction.recipient === searchAddress ||
              liskCodec.identityToAddress(transaction.creator) === searchAddress,
          ).toEqual(true);
        }
      }

      // minHeight = 2 and maxHeight = 100
      {
        const results = await connection.searchTx({
          sentFromOrTo: searchAddress,
          minHeight: 2,
          maxHeight: 100,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          expect(result.height).toBeGreaterThanOrEqual(2);
          expect(result.height).toBeLessThanOrEqual(100);
          const transaction = result.transaction;
          if (!isSendTransaction(transaction)) {
            throw new Error(`Unexpected transaction type: ${transaction.kind}`);
          }
          expect(
            transaction.recipient === searchAddress ||
              liskCodec.identityToAddress(transaction.creator) === searchAddress,
          ).toEqual(true);
        }
      }

      // minHeight > maxHeight
      {
        const results = await connection.searchTx({
          sentFromOrTo: searchAddress,
          minHeight: 100,
          maxHeight: 99,
        });
        expect(results.length).toEqual(0);
      }

      connection.disconnect();
    });

    it("can search transactions by ID and minHeight/maxHeight", async () => {
      pendingWithoutLiskDevnet();
      const connection = await LiskConnection.establish(devnetBase);

      // by recipient address (from lisk/init.sh)
      const searchId = "12493173350733478622" as TransactionId;

      // minHeight = 2
      {
        const results = await connection.searchTx({ id: searchId, minHeight: 2 });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          expect(result.transactionId).toEqual(searchId);
          expect(result.height).toBeGreaterThanOrEqual(2);
        }
      }

      // maxHeight = 100
      {
        const results = await connection.searchTx({ id: searchId, maxHeight: 100 });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          expect(result.transactionId).toEqual(searchId);
          expect(result.height).toBeLessThanOrEqual(100);
        }
      }

      // minHeight = 2 and maxHeight = 100
      {
        const results = await connection.searchTx({
          id: searchId,
          minHeight: 2,
          maxHeight: 100,
        });
        expect(results.length).toBeGreaterThanOrEqual(1);
        for (const result of results) {
          expect(result.transactionId).toEqual(searchId);
          expect(result.height).toBeGreaterThanOrEqual(2);
          expect(result.height).toBeLessThanOrEqual(100);
        }
      }

      // minHeight > maxHeight
      {
        const results = await connection.searchTx({
          id: searchId,
          minHeight: 100,
          maxHeight: 99,
        });
        expect(results.length).toEqual(0);
      }

      connection.disconnect();
    });
  });

  describe("liveTx", () => {
    it("can listen to transactions by recipient address (transactions in history and updates)", done => {
      pendingWithoutLiskDevnet();

      (async () => {
        const connection = await LiskConnection.establish(devnetBase);

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const sender = await profile.createIdentity(wallet.id, devnetChainId, await devnetDefaultKeypair);

        const sendA: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: devnetDefaultAmount,
          memo: `liveTx() test A ${Math.random()}`,
        };

        const sendB: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: devnetDefaultAmount,
          memo: `liveTx() test B ${Math.random()}`,
        };

        const sendC: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: devnetDefaultAmount,
          memo: `liveTx() test C ${Math.random()}`,
        };

        const [nonceA, nonceB, nonceC] = await connection.getNonces({ pubkey: sender.pubkey }, 3);
        const signedA = await profile.signTransaction(sendA, liskCodec, nonceA);
        const signedB = await profile.signTransaction(sendB, liskCodec, nonceB);
        const signedC = await profile.signTransaction(sendC, liskCodec, nonceC);
        const bytesToPostA = liskCodec.bytesToPost(signedA);
        const bytesToPostB = liskCodec.bytesToPost(signedB);
        const bytesToPostC = liskCodec.bytesToPost(signedC);

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
      pendingWithoutLiskDevnet();

      (async () => {
        const connection = await LiskConnection.establish(devnetBase);

        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const sender = await profile.createIdentity(wallet.id, devnetChainId, await devnetDefaultKeypair);

        const recipientAddress = await randomAddress();
        const send: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: devnetDefaultAmount,
          memo: `liveTx() test ${Math.random()}`,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(send, liskCodec, nonce);
        const bytesToPost = liskCodec.bytesToPost(signed);

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
      pendingWithoutLiskDevnet();

      (async () => {
        const connection = await LiskConnection.establish(devnetBase);

        const recipientAddress = await randomAddress();

        // send transactions

        const profile = new UserProfile();
        const wallet = profile.addWallet(new Ed25519Wallet());
        const sender = await profile.createIdentity(wallet.id, devnetChainId, await devnetDefaultKeypair);

        const send: SendTransaction & WithCreator = {
          kind: "bcp/send",
          creator: sender,
          recipient: recipientAddress,
          amount: devnetDefaultAmount,
          memo: `liveTx() test ${Math.random()}`,
        };

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(send, liskCodec, nonce);
        const bytesToPost = liskCodec.bytesToPost(signed);

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

  describe("getFeeQuote", () => {
    it("works for send transaction", async () => {
      const connection = new LiskConnection(dummynetBase, dummynetChainId);

      const sendTransaction: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: {
          chainId: dummynetChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: fromHex("aabbccdd") as PublicKeyBytes,
          },
        },
        recipient: devnetDefaultRecipient,
        memo: `We ❤️ developers – iov.one ${Math.random()}`,
        amount: devnetDefaultAmount,
      };
      const result = await connection.getFeeQuote(sendTransaction);
      expect(result.tokens).toEqual({
        quantity: "10000000",
        fractionalDigits: 8,
        tokenTicker: "LSK" as TokenTicker,
      });
      expect(result.gasPrice).toBeUndefined();
      expect(result.gasLimit).toBeUndefined();
    });

    it("throws for unsupported transaction kind", async () => {
      const connection = new LiskConnection(dummynetBase, dummynetChainId);

      const otherTransaction: UnsignedTransaction = {
        kind: "other/kind",
        creator: {
          chainId: dummynetChainId,
          pubkey: {
            algo: Algorithm.Ed25519,
            data: fromHex("aabbccdd") as PublicKeyBytes,
          },
        },
      };
      await connection
        .getFeeQuote(otherTransaction)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/transaction of unsupported kind/i));
    });
  });
});
