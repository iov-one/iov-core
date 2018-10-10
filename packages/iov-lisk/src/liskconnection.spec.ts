import { Address, BcpAccountQuery, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Derivation } from "@iov/dpos";
import { Encoding } from "@iov/encoding";
import { Ed25519Wallet } from "@iov/keycontrol";
import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes } from "@iov/tendermint-types";

import { liskCodec } from "./liskcodec";
import { generateNonce, LiskConnection } from "./liskconnection";

const { fromHex } = Encoding;

function pendingWithoutLongRunning(): void {
  if (!process.env.LONG_RUNNING_ENABLED) {
    pending("Set LONG_RUNNING_ENABLED to enable long running tests");
  }
}

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
  // TODO: rewrite tests based on testnet and remove the following lines
  const testnetBase = "https://testnet.lisk.io";
  const testnetChainId = "da3ed6a45429278bac2666961289ca17ad86595d33b31037615d4b8e8f158bba" as ChainId;

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
    const connection = new LiskConnection(base, liskTestnet);
    const response = await connection.getTicker("LSK" as TokenTicker);
    expect(response.data.length).toEqual(1);
    expect(response.data[0].tokenTicker).toEqual("LSK");
    expect(response.data[0].tokenName).toEqual("Lisk");
    expect(response.data[0].sigFigs).toEqual(8);
  });

  it("produces empty result for non-existing ticker", async () => {
    const connection = new LiskConnection(base, liskTestnet);
    const response = await connection.getTicker("ETH" as TokenTicker);
    expect(response.data.length).toEqual(0);
  });

  it("can get all tickers", async () => {
    const connection = new LiskConnection(base, liskTestnet);
    const response = await connection.getAllTickers();
    expect(response.data.length).toEqual(1);
    expect(response.data[0].tokenTicker).toEqual("LSK");
    expect(response.data[0].tokenName).toEqual("Lisk");
    expect(response.data[0].sigFigs).toEqual(8);
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

  it("can get account from address", async () => {
    pendingWithoutLongRunning();
    const connection = await LiskConnection.establish(testnetBase);
    const query: BcpAccountQuery = { address: "6472030874529564639L" as Address };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual("6472030874529564639L");
    expect(account.data[0].balance[0].tokenTicker).toEqual("LSK");
    expect(account.data[0].balance[0].sigFigs).toEqual(8);
    expect(account.data[0].balance[0].whole).toEqual(98);
    expect(account.data[0].balance[0].fractional).toEqual(66543211);
  });

  it("can get account from pubkey", async () => {
    pendingWithoutLongRunning();
    const connection = await LiskConnection.establish(testnetBase);
    const pubkey: PublicKeyBundle = {
      algo: Algorithm.Ed25519,
      data: fromHex("ac681190391fe048d133a60e9b49f7ac0a8b0500b58a9f176b88aee1e79fe735") as PublicKeyBytes,
    };
    const query: BcpAccountQuery = { pubkey: pubkey };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual("6472030874529564639L");
    expect(account.data[0].balance[0].tokenTicker).toEqual("LSK");
    expect(account.data[0].balance[0].sigFigs).toEqual(8);
    expect(account.data[0].balance[0].whole).toEqual(98);
    expect(account.data[0].balance[0].fractional).toEqual(66543211);
  });

  it("returns empty list when getting an unused account", async () => {
    pendingWithoutLiskDevnet();
    const unusedAddress = "5648777643193648871L" as Address;
    const connection = await LiskConnection.establish(devnetBase);
    const response = await connection.getAccount({ address: unusedAddress });
    expect(response).toBeTruthy();
    expect(response.data).toBeTruthy();
    expect(response.data.length).toEqual(0);
  });

  it("can get nonce", async () => {
    pendingWithoutLiskDevnet();
    const connection = await LiskConnection.establish(devnetBase);
    const query: BcpAccountQuery = { address: "6472030874529564639L" as Address };
    const nonce = await connection.getNonce(query);

    expect(nonce.data[0].address).toEqual("6472030874529564639L");
    // nonce is current timestamp +/- one second
    expect(nonce.data[0].nonce.toNumber()).toBeGreaterThanOrEqual(Date.now() / 1000 - 1);
    expect(nonce.data[0].nonce.toNumber()).toBeLessThanOrEqual(Date.now() / 1000 + 1);
  });

  it(
    "can post transaction",
    async () => {
      pendingWithoutLongRunning();

      const wallet = new Ed25519Wallet();
      const mainIdentity = await wallet.createIdentity(
        await Derivation.passphraseToKeypair(
          "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
        ),
      );

      const recipientAddress = "6076671634347365051L" as Address;

      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId: testnetChainId,
        signer: mainIdentity.pubkey,
        recipient: recipientAddress,
        memo: "We ❤️ developers – iov.one",
        amount: {
          whole: 1,
          fractional: 44550000,
          tokenTicker: "LSK" as TokenTicker,
        },
      };

      // Encode creation timestamp into nonce
      const nonce = generateNonce();
      const signingJob = liskCodec.bytesToSign(sendTx, nonce);
      const signature = await wallet.createTransactionSignature(
        mainIdentity,
        signingJob.bytes,
        signingJob.prehashType,
        testnetChainId,
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
      const bytesToPost = liskCodec.bytesToPost(signedTransaction);

      const connection = await LiskConnection.establish(testnetBase);
      const result = await connection.postTx(bytesToPost);
      expect(result).toBeTruthy();
      expect(result.metadata.height).toBeDefined();
      expect(result.metadata.height).toBeGreaterThan(6000000);
      expect(result.metadata.height).toBeLessThan(8000000);
    },
    40 * 1000,
  );
});
