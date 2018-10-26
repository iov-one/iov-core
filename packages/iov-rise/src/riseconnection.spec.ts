import { Address, BcpAccountQuery, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { Ed25519Wallet } from "@iov/keycontrol";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";

import { passphraseToKeypair } from "./derivation";
import { riseCodec } from "./risecodec";
import { generateNonce, RiseConnection } from "./riseconnection";

const { fromHex } = Encoding;
const riseTestnet = "e90d39ac200c495b97deb6d9700745177c7fc4aa80a404108ec820cbeced054c" as ChainId;

describe("RiseConnection", () => {
  const base = "https://twallet.rise.vision";

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
    expect(response.data[0].sigFigs).toEqual(8);
  });

  it("can get non-existing ticker", async () => {
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
    expect(response.data[0].sigFigs).toEqual(8);
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
    expect(account.data[0].balance[0].sigFigs).toEqual(8);
    expect(account.data[0].balance[0].whole).toEqual(52);
    expect(account.data[0].balance[0].fractional).toEqual(98643212);
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
    expect(account.data[0].balance[0].sigFigs).toEqual(8);
    expect(account.data[0].balance[0].whole).toEqual(52);
    expect(account.data[0].balance[0].fractional).toEqual(98643212);
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

  it("can post transaction", async () => {
    const wallet = new Ed25519Wallet();
    const mainIdentity = await wallet.createIdentity(
      await passphraseToKeypair(
        "squeeze frog deposit chase sudden clutch fortune spring tone have snow column",
      ),
    );

    const recipientAddress = "10145108642177909005R" as Address;

    const sendTx: SendTx = {
      kind: TransactionKind.Send,
      chainId: riseTestnet,
      signer: mainIdentity.pubkey,
      recipient: recipientAddress,
      amount: {
        whole: 1,
        fractional: 44550000,
        tokenTicker: "RISE" as TokenTicker,
      },
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

    const signedTransaction = {
      transaction: sendTx,
      primarySignature: {
        nonce: nonce,
        publicKey: mainIdentity.pubkey,
        signature: signature,
      },
      otherSignatures: [],
    };
    const bytesToPost = riseCodec.bytesToPost(signedTransaction);

    const connection = await RiseConnection.establish(base);
    const result = await connection.postTx(bytesToPost);
    expect(result).toBeTruthy();
  });
});
