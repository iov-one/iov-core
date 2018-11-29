import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes, TxId } from "@iov/base-types";
import {
  Address,
  Amount,
  BcpAccountQuery,
  BcpBlockInfo,
  BcpTransactionState,
  SendTx,
  SignedTransaction,
  TokenTicker,
  TransactionKind,
} from "@iov/bcp-types";
import { Derivation } from "@iov/dpos";
import { Encoding } from "@iov/encoding";
import { Ed25519Wallet } from "@iov/keycontrol";

import { riseCodec } from "./risecodec";
import { generateNonce, RiseConnection } from "./riseconnection";

const { fromHex, toAscii } = Encoding;
const riseTestnet = "e90d39ac200c495b97deb6d9700745177c7fc4aa80a404108ec820cbeced054c" as ChainId;

describe("RiseConnection", () => {
  const base = "https://twallet.rise.vision";
  const defaultKeypair = Derivation.passphraseToKeypair(
    "squeeze frog deposit chase sudden clutch fortune spring tone have snow column",
  );
  const defaultRecipientAddress = "10145108642177909005R" as Address;
  const defaultSendAmount: Amount = {
    quantity: "14550000",
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
    const response = await connection.getTicker("RISE" as TokenTicker);
    expect(response.data.length).toEqual(1);
    expect(response.data[0].tokenTicker).toEqual("RISE");
    expect(response.data[0].tokenName).toEqual("RISE");
  });

  it("produces empty result for non-existing ticker", async () => {
    const connection = new RiseConnection(base, riseTestnet);
    const response = await connection.getTicker("ETH" as TokenTicker);
    expect(response.data.length).toEqual(0);
  });

  it("can get all tickers", async () => {
    const connection = new RiseConnection(base, riseTestnet);
    const response = await connection.getAllTickers();
    expect(response.data.length).toEqual(1);
    expect(response.data[0].tokenTicker).toEqual("RISE");
    expect(response.data[0].tokenName).toEqual("RISE");
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

  it("can get account from address", async () => {
    const connection = await RiseConnection.establish(base);
    const query: BcpAccountQuery = { address: "6472030874529564639R" as Address };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual("6472030874529564639R");
    expect(account.data[0].balance[0].tokenTicker).toEqual("RISE");
    expect(account.data[0].balance[0].fractionalDigits).toEqual(8);
    expect(account.data[0].balance[0].quantity).toEqual("5298643212");
  });

  it("can get account from pubkey", async () => {
    const connection = await RiseConnection.establish(base);
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("ac681190391fe048d133a60e9b49f7ac0a8b0500b58a9f176b88aee1e79fe735") as PublicKeyBytes,
    };
    const query: BcpAccountQuery = { pubkey: pubkey };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual("6472030874529564639R");
    expect(account.data[0].balance[0].tokenTicker).toEqual("RISE");
    expect(account.data[0].balance[0].fractionalDigits).toEqual(8);
    expect(account.data[0].balance[0].quantity).toEqual("5298643212");
  });

  it("returns empty list when getting an unused account", async () => {
    const unusedAddress = "5648777643193648871R" as Address;
    const connection = await RiseConnection.establish(base);
    const response = await connection.getAccount({ address: unusedAddress });
    expect(response).toBeTruthy();
    expect(response.data).toBeTruthy();
    expect(response.data.length).toEqual(0);
  });

  it("can get nonce", async () => {
    const connection = await RiseConnection.establish(base);
    const query: BcpAccountQuery = { address: "5399275477602875017R" as Address };
    const nonce = await connection.getNonce(query);

    expect(nonce.data[0].address).toEqual("5399275477602875017R");
    // nonce is current timestamp +/- one second
    expect(nonce.data[0].nonce.toNumber()).toBeGreaterThanOrEqual(Date.now() / 1000 - 1);
    expect(nonce.data[0].nonce.toNumber()).toBeLessThanOrEqual(Date.now() / 1000 + 1);
  });

  describe("postTx", () => {
    it("can post transaction", async () => {
      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(await defaultKeypair);

      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId: riseTestnet,
        signer: mainIdentity.pubkey,
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
        riseTestnet,
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
        const mainIdentity = await wallet.createIdentity(await defaultKeypair);

        const sendTx: SendTx = {
          kind: TransactionKind.Send,
          chainId: riseTestnet,
          signer: mainIdentity.pubkey,
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
          riseTestnet,
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
    }, 80_000);

    it("throws for transaction with corrupted signature", async () => {
      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(await defaultKeypair);

      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId: riseTestnet,
        signer: mainIdentity.pubkey,
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
        riseTestnet,
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
    it("can search transaction", async () => {
      const connection = await RiseConnection.establish(base);

      // by non-existing ID
      {
        const searchId = "98568736528934587";
        const results = await connection.searchTx({ hash: toAscii(searchId) as TxId, tags: [] });
        expect(results.length).toEqual(0);
      }

      // by existing ID (https://texplorer.rise.vision/tx/530955287567640950)
      {
        const searchId = "530955287567640950";
        const results = await connection.searchTx({ hash: toAscii(searchId) as TxId, tags: [] });
        expect(results.length).toEqual(1);
        const result = results[0];
        expect(result.height).toEqual(1156579);
        expect(result.txid).toEqual(toAscii(searchId));
        const transaction = result.transaction;
        if (transaction.kind !== TransactionKind.Send) {
          throw new Error("Unexpected transaction type");
        }
        expect(transaction.recipient).toEqual("10145108642177909005R");
        expect(transaction.amount.quantity).toEqual("14550000");
      }

      connection.disconnect();
    });
  });
});
