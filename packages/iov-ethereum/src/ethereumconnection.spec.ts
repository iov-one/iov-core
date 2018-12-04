import { Algorithm, TxId } from "@iov/base-types";
import {
  Address,
  BcpAccountQuery,
  SendTx,
  SignedTransaction,
  TokenTicker,
  TransactionKind,
} from "@iov/bcp-types";
import { Encoding } from "@iov/encoding";
import { HdPaths, Secp256k1HdWallet } from "@iov/keycontrol";

import { ethereumCodec } from "./ethereumcodec";
import { EthereumConnection } from "./ethereumconnection";
import { TestConfig } from "./testconfig";
import { hexPadToEven } from "./utils";

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

describe("EthereumConnection", () => {
  const base = TestConfig.base;
  const nodeChainId = TestConfig.chainId;
  const minHeight = TestConfig.minHeight;
  const address = TestConfig.address;
  const quantity = TestConfig.quantity;
  const gasPrice = TestConfig.gasPrice;
  const gasLimit = TestConfig.gasLimit;
  const waitForTx = TestConfig.waitForTx;

  it(`can be constructed for ${base}`, () => {
    pendingWithoutEthereum();
    const connection = new EthereumConnection(base, nodeChainId);
    expect(connection).toBeTruthy();
  });

  it("can get chain ID", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const chainId = connection.chainId();
    expect(chainId).toEqual(nodeChainId);
  });

  it("can get height", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const height = await connection.height();
    expect(height).toBeGreaterThan(minHeight);
  });

  it("can get account from address", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const query: BcpAccountQuery = { address: address as Address };
    const account = await connection.getAccount(query);
    expect(account.data[0].address).toEqual(address);
    expect(account.data[0].balance[0].tokenTicker).toEqual("ETH");
    expect(account.data[0].balance[0].fractionalDigits).toEqual(18);
    expect(account.data[0].balance[0].quantity).toEqual(quantity);
  });

  it("can get nonce", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);

    // by address
    {
      const query: BcpAccountQuery = { address: TestConfig.address as Address };
      const nonce = (await connection.getNonce(query)).data[0];
      expect(nonce).toEqual(TestConfig.nonce);
    }

    // by pubkey
    {
      const query: BcpAccountQuery = { pubkey: { algo: Algorithm.Secp256k1, data: TestConfig.pubkey } };
      const nonce = (await connection.getNonce(query)).data[0];
      expect(nonce).toEqual(TestConfig.nonce);
    }

    connection.disconnect();
  });

  describe("postTx", () => {
    it("can post transaction", async () => {
      pendingWithoutEthereum();

      const wallet = Secp256k1HdWallet.fromMnemonic(
        "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
      );
      const mainIdentity = await wallet.createIdentity(HdPaths.bip44(60, 0, 0, 1));

      const recipientAddress = "0xE137f5264b6B528244E1643a2D570b37660B7F14" as Address;

      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId: nodeChainId,
        signer: mainIdentity.pubkey,
        recipient: recipientAddress,
        amount: {
          quantity: "3445500",
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasPrice: {
          quantity: gasPrice,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasLimit: {
          quantity: gasLimit,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        memo: "We \u2665 developers – iov.one",
      };
      const connection = await EthereumConnection.establish(base);
      const senderAddress = ethereumCodec.keyToAddress(mainIdentity.pubkey);
      const query: BcpAccountQuery = { address: senderAddress as Address };
      const nonceResp = await connection.getNonce(query);
      const signingJob = ethereumCodec.bytesToSign(sendTx, nonceResp.data[0]);
      const signature = await wallet.createTransactionSignature(
        mainIdentity,
        signingJob.bytes,
        signingJob.prehashType,
        nodeChainId,
      );

      const signedTransaction: SignedTransaction = {
        transaction: sendTx,
        primarySignature: {
          nonce: nonceResp.data[0],
          pubkey: mainIdentity.pubkey,
          signature: signature,
        },
        otherSignatures: [],
      };
      const bytesToPost = ethereumCodec.bytesToPost(signedTransaction);

      const result = await connection.postTx(bytesToPost);
      expect(result).toBeTruthy();
      expect(result.data.message).toBeNull();
    });
  });

  describe("searchTx", () => {
    it("throws error for invalid transaction hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(base);
      // invalid lenght
      const invalidHashLenght = "0x1234567890abcdef";
      const invalidTxId = Encoding.fromHex(hexPadToEven(invalidHashLenght)) as TxId;
      await connection
        .searchTx({ hash: invalidTxId, tags: [] })
        .then(() => fail("must not resolve"))
        .catch(error => expect(error).toMatch(/Invalid transaction hash length/));
      connection.disconnect();
    });

    it("can search non-existing transaction by hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(base);
      const nonExistingHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
      const nonExistingId = Encoding.fromHex(hexPadToEven(nonExistingHash)) as TxId;
      const results = await connection.searchTx({ hash: nonExistingId, tags: [] });
      expect(results.length).toEqual(0);
      connection.disconnect();
    });

    it("can search previous posted transaction by hash", async () => {
      pendingWithoutEthereum();
      const wallet = Secp256k1HdWallet.fromMnemonic(
        "oxygen fall sure lava energy veteran enroll frown question detail include maximum",
      );
      const mainIdentity = await wallet.createIdentity(HdPaths.bip44(60, 0, 0, 1));

      const recipientAddress = "0xE137f5264b6B528244E1643a2D570b37660B7F14" as Address;

      const sendTx: SendTx = {
        kind: TransactionKind.Send,
        chainId: nodeChainId,
        signer: mainIdentity.pubkey,
        recipient: recipientAddress,
        amount: {
          quantity: "5445500",
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasPrice: {
          quantity: gasPrice,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        gasLimit: {
          quantity: gasLimit,
          fractionalDigits: 18,
          tokenTicker: "ETH" as TokenTicker,
        },
        memo: "Search tx test" + new Date(),
      };
      const connection = await EthereumConnection.establish(base);
      const senderAddress = ethereumCodec.keyToAddress(mainIdentity.pubkey);
      const query: BcpAccountQuery = { address: senderAddress as Address };
      const nonceResp = await connection.getNonce(query);
      const signingJob = ethereumCodec.bytesToSign(sendTx, nonceResp.data[0]);
      const signature = await wallet.createTransactionSignature(
        mainIdentity,
        signingJob.bytes,
        signingJob.prehashType,
        nodeChainId,
      );

      const signedTransaction: SignedTransaction = {
        transaction: sendTx,
        primarySignature: {
          nonce: nonceResp.data[0],
          pubkey: mainIdentity.pubkey,
          signature: signature,
        },
        otherSignatures: [],
      };
      const bytesToPost = ethereumCodec.bytesToPost(signedTransaction);

      const resultPost = await connection.postTx(bytesToPost);
      const postedTxId = resultPost.data.txid;
      await sleep(waitForTx);
      const resultSearch = await connection.searchTx({ hash: postedTxId, tags: [] });
      expect(resultSearch.length).toEqual(1);
      const result = resultSearch[0];
      expect(result.txid).toEqual(postedTxId);
      const transaction = result.transaction;
      if (transaction.kind !== TransactionKind.Send) {
        throw new Error("Unexpected transaction type");
      }
      expect(result.transaction.kind).toEqual(TransactionKind.Send);
      expect(transaction.recipient).toEqual("0xe137f5264b6b528244e1643a2d570b37660b7f14");
      expect(transaction.amount.quantity).toEqual("5445500");
      connection.disconnect();
    });

    // TODO: load ganache with db from github
    xit("can search a transaction by hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(base);
      const storedTxId = new Uint8Array([]) as TxId;
      const results = await connection.searchTx({ hash: storedTxId, tags: [] });
      expect(results.length).toEqual(1);
      const result = results[0];
      expect(result.txid).toEqual(storedTxId);
      const transaction = result.transaction;
      if (transaction.kind !== TransactionKind.Send) {
        throw new Error("Unexpected transaction type");
      }
      expect(result.transaction.kind).toEqual(TransactionKind.Send);
      expect(transaction.recipient).toEqual("recipient_address");
      expect(transaction.amount.quantity).toEqual("tx_quantity");
      connection.disconnect();
    });

    it("can search a transaction by account", async () => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();
      const connection = await EthereumConnection.establish(base);
      const results = await connection.searchTx({
        tags: [
          { key: "apiLink", value: TestConfig.scraperApi },
          { key: "account", value: TestConfig.scraperAddress },
          { key: "parserChainId", value: TestConfig.scraperChainId },
        ],
      });
      expect(results.length).toBeGreaterThan(1);
      connection.disconnect();
    });
  });
});
