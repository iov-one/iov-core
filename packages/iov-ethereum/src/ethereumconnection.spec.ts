import { Algorithm } from "@iov/base-types";
import {
  Address,
  BcpAccountQuery,
  isSendTransaction,
  SendTransaction,
  SignedTransaction,
  TokenTicker,
  TransactionId,
} from "@iov/bcp-types";
import { HdPaths, Secp256k1HdWallet } from "@iov/keycontrol";

import { ethereumCodec } from "./ethereumcodec";
import { EthereumConnection } from "./ethereumconnection";
import { TestConfig } from "./testconfig";

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

      const sendTx: SendTransaction = {
        domain: "ethereum",
        kind: "send",
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
      expect(result.log).toBeUndefined();
    });
  });

  describe("searchTx", () => {
    it("throws error for invalid transaction hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(base);
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
      const connection = await EthereumConnection.establish(base);
      const nonExistingHash = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef" as TransactionId;
      const results = await connection.searchTx({ id: nonExistingHash });
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

      const sendTx: SendTransaction = {
        domain: "ethereum",
        kind: "send",
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
      const nonceResp = await connection.getNonce({ address: senderAddress });
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
      expect(resultPost.transactionId).toMatch(/^0x[0-9a-f]{64}$/);
      await sleep(waitForTx);

      const resultSearch = await connection.searchTx({ id: resultPost.transactionId });
      expect(resultSearch.length).toEqual(1);
      const result = resultSearch[0];
      expect(result.transactionId).toEqual(resultPost.transactionId);
      const transaction = result.transaction;
      if (!isSendTransaction(transaction)) {
        throw new Error("Unexpected transaction type");
      }
      expect(transaction.recipient).toEqual("0xe137f5264b6b528244e1643a2d570b37660b7f14");
      expect(transaction.amount.quantity).toEqual("5445500");
      connection.disconnect();
    });

    // TODO: load ganache with db from github
    xit("can search a transaction by hash", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(base);
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
      connection.disconnect();
    });

    it("can search a transaction by account", async () => {
      pendingWithoutEthereum();
      pendingWithoutEthereumScraper();
      const connection = await EthereumConnection.establish(base);
      const results = await connection.searchTx({
        tags: [
          { key: "apiLink", value: TestConfig.scraper!.api },
          { key: "account", value: TestConfig.scraper!.address },
        ],
      });
      expect(results.length).toBeGreaterThan(1);
      connection.disconnect();
    });
  });

  describe("getBlockHeader", () => {
    it("can get header from block", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(base);
      const blockHeader = await connection.getBlockHeader(0);
      expect(blockHeader.id).toMatch(/^0x[0-9a-f]{64}$/);
      expect(blockHeader.height).toEqual(0);
      expect(blockHeader.transactionCount).toBeGreaterThanOrEqual(0);
      connection.disconnect();
    });

    it("throws error from invalid block number", async () => {
      pendingWithoutEthereum();
      const connection = await EthereumConnection.establish(base);
      await connection
        .getBlockHeader(99999999999999)
        .then(() => fail("promise must be rejected"))
        .catch(err => expect(err).toMatch(/Header 99999999999999 doesn't exist yet/));
      connection.disconnect();
    });
  });
});
