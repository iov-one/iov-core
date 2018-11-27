import {
  Address,
  BcpAccountQuery,
  SendTx,
  SignedTransaction,
  TokenTicker,
  TransactionKind,
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

describe("EthereumConnection", () => {
  const base = TestConfig.base;
  const nodeChainId = TestConfig.chainId;
  const minHeight = TestConfig.minHeight;
  const address = TestConfig.address;
  const whole = TestConfig.whole;
  const fractional = TestConfig.fractional;
  const nonce = TestConfig.nonce;
  const gasPrice = TestConfig.gasPrice;
  const gasLimit = TestConfig.gasLimit;

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
    expect(account.data[0].balance[0].whole).toEqual(whole);
    expect(account.data[0].balance[0].fractional).toEqual(fractional);
  });

  it("can get nonce", async () => {
    pendingWithoutEthereum();
    const connection = await EthereumConnection.establish(base);
    const query: BcpAccountQuery = { address: address as Address };
    const nonceResp = await connection.getNonce(query);

    expect(nonceResp.data[0].address).toEqual(address);
    expect(nonceResp.data[0].nonce).toEqual(nonce);
  });

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
        whole: 0,
        fractional: 3445500,
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      gasPrice: {
        whole: 0,
        fractional: gasPrice,
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      gasLimit: {
        whole: 0,
        fractional: gasLimit,
        fractionalDigits: 18,
        tokenTicker: "ETH" as TokenTicker,
      },
      memo: "We \u2665 developers – iov.one",
    };
    const connection = await EthereumConnection.establish(base);
    const senderAddress = ethereumCodec.keyToAddress(mainIdentity.pubkey);
    const query: BcpAccountQuery = { address: senderAddress as Address };
    const nonceResp = await connection.getNonce(query);
    const signingJob = ethereumCodec.bytesToSign(sendTx, nonceResp.data[0].nonce);
    const signature = await wallet.createTransactionSignature(
      mainIdentity,
      signingJob.bytes,
      signingJob.prehashType,
      nodeChainId,
    );

    const signedTransaction: SignedTransaction = {
      transaction: sendTx,
      primarySignature: {
        nonce: nonceResp.data[0].nonce,
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
