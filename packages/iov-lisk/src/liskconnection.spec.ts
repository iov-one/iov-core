import { ReadonlyDate } from "readonly-date";

import {
  Address,
  Algorithm,
  Amount,
  BcpAccountQuery,
  BcpAddressQuery,
  BcpBlockInfo,
  BcpPubkeyQuery,
  BcpTransactionState,
  ChainId,
  isSendTransaction,
  PublicKeyBundle,
  PublicKeyBytes,
  SendTransaction,
  SignatureBytes,
  SignedTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp-types";
import { Derivation } from "@iov/dpos";
import { Encoding } from "@iov/encoding";
import { Ed25519Wallet } from "@iov/keycontrol";

import { liskCodec } from "./liskcodec";
import { generateNonce, LiskConnection } from "./liskconnection";

const { fromHex } = Encoding;

function pendingWithoutLiskDevnet(): void {
  if (!process.env.LISK_ENABLED) {
    pending("Set LISK_ENABLED to enable Lisk network tests");
  }
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

  it("can get existing ticker", async () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    const ticker = await connection.getTicker("LSK" as TokenTicker);
    expect(ticker).toBeDefined();
    expect(ticker!.tokenTicker).toEqual("LSK");
    expect(ticker!.tokenName).toEqual("Lisk");
  });

  it("produces empty result for non-existing ticker", async () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    const ticker = await connection.getTicker("ETH" as TokenTicker);
    expect(ticker).toBeUndefined();
  });

  it("can get all tickers", async () => {
    const connection = new LiskConnection(dummynetBase, dummynetChainId);
    const tickers = await connection.getAllTickers();
    expect(tickers.length).toEqual(1);
    expect(tickers[0].tokenTicker).toEqual("LSK");
    expect(tickers[0].tokenName).toEqual("Lisk");
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
      const query: BcpAccountQuery = { address: "1349293588603668134L" as Address };
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
      const query: BcpAccountQuery = { pubkey: pubkey };
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

  it("can get nonce", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);

    // by address
    {
      const query: BcpAddressQuery = { address: "6472030874529564639L" as Address };
      const nonce = await connection.getNonce(query);
      // nonce is current unix timestamp +/- one second
      expect(nonce.toNumber()).toBeGreaterThanOrEqual(Date.now() / 1000 - 1);
      expect(nonce.toNumber()).toBeLessThanOrEqual(Date.now() / 1000 + 1);
    }

    // by pubkey
    {
      const query: BcpPubkeyQuery = {
        pubkey: {
          algo: Algorithm.Ed25519,
          data: fromHex("e9e00a111875ccd0c2c937d87da18532cf99d011e0e8bfb981638f57427ba2c6") as PublicKeyBytes,
        },
      };
      const nonce = await connection.getNonce(query);
      // nonce is current unix timestamp +/- one second
      expect(nonce.toNumber()).toBeGreaterThanOrEqual(Date.now() / 1000 - 1);
      expect(nonce.toNumber()).toBeLessThanOrEqual(Date.now() / 1000 + 1);
    }

    connection.disconnect();
  });

  describe("getHeader", () => {
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

  describe("postTx", () => {
    it("can post transaction", async () => {
      pendingWithoutLiskDevnet();

      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(devnetChainId, await devnetDefaultKeypair);

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: devnetChainId,
        signer: mainIdentity.pubkey,
        recipient: devnetDefaultRecipient,
        memo: `We ❤️ developers – iov.one ${Math.random()}`,
        amount: devnetDefaultAmount,
      };

      // Encode creation timestamp into nonce
      const nonce = generateNonce();
      const signingJob = liskCodec.bytesToSign(sendTx, nonce);
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
      const bytesToPost = liskCodec.bytesToPost(signedTransaction);

      const connection = await LiskConnection.establish(devnetBase);
      const result = await connection.postTx(bytesToPost);
      expect(result).toBeTruthy();
    });

    it("can post transaction and watch confirmations", done => {
      pendingWithoutLiskDevnet();

      (async () => {
        const wallet = new Ed25519Wallet();
        const mainIdentity = await wallet.createIdentity(devnetChainId, await devnetDefaultKeypair);

        const sendTx: SendTransaction = {
          kind: "bcp/send",
          chainId: devnetChainId,
          signer: mainIdentity.pubkey,
          recipient: devnetDefaultRecipient,
          memo: `We ❤️ developers – iov.one ${Math.random()}`,
          amount: devnetDefaultAmount,
        };

        // Encode creation timestamp into nonce
        const nonce = generateNonce();
        const signingJob = liskCodec.bytesToSign(sendTx, nonce);
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
        const bytesToPost = liskCodec.bytesToPost(signedTransaction);

        const connection = await LiskConnection.establish(devnetBase);
        const heightBeforeTransaction = await connection.height();
        const result = await connection.postTx(bytesToPost);
        expect(result).toBeTruthy();
        expect(result.blockInfo.value.state).toEqual(BcpTransactionState.Pending);

        const events = new Array<BcpBlockInfo>();
        const subscription = result.blockInfo.updates.subscribe({
          next: info => {
            events.push(info);

            if (events.length === 2) {
              expect(events[0]).toEqual({ state: BcpTransactionState.Pending });
              expect(events[1]).toEqual({
                state: BcpTransactionState.InBlock,
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

      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(devnetChainId, await devnetDefaultKeypair);

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: devnetChainId,
        signer: mainIdentity.pubkey,
        recipient: devnetDefaultRecipient,
        memo: `We ❤️ developers – iov.one ${Math.random()}`,
        amount: devnetDefaultAmount,
      };

      // Encode creation timestamp into nonce
      const nonce = generateNonce();
      const signingJob = liskCodec.bytesToSign(sendTx, nonce);
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
      const bytesToPost = liskCodec.bytesToPost(signedTransaction);

      const connection = await LiskConnection.establish(devnetBase);
      const heightBeforeTransaction = await connection.height();
      const result = await connection.postTx(bytesToPost);
      await result.blockInfo.waitFor(
        info => info.state === BcpTransactionState.InBlock && info.confirmations === 4,
      );

      expect(result.blockInfo.value).toEqual({
        state: BcpTransactionState.InBlock,
        height: heightBeforeTransaction + 1,
        confirmations: 4,
      });
    }, 60000);

    it("throws for invalid transaction", async () => {
      pendingWithoutLiskDevnet();

      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(devnetChainId, await devnetDefaultKeypair);

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: devnetChainId,
        signer: mainIdentity.pubkey,
        recipient: devnetDefaultRecipient,
        memo: "We ❤️ developers – iov.one",
        amount: devnetDefaultAmount,
      };

      // Encode creation timestamp into nonce
      const nonce = generateNonce();
      const signingJob = liskCodec.bytesToSign(sendTx, nonce);
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
      const bytesToPost = liskCodec.bytesToPost(signedTransaction);

      const connection = await LiskConnection.establish(devnetBase);
      await connection
        .postTx(bytesToPost)
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/failed with status code 409/i));
    });

    it("can search transaction", async () => {
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
  });
});
