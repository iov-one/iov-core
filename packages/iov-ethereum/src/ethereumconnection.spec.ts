import { Address, BcpAccountQuery, SendTx, TokenTicker, TransactionKind } from "@iov/bcp-types";
import { Slip10RawIndex } from "@iov/crypto";
import { Secp256k1HdWallet } from "@iov/keycontrol";

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
    expect(account.data[0].balance[0].sigFigs).toEqual(18);
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
      "wagon stock borrow episode laundry kitten salute link globe zero feed marble",
    );
    const mainIdentity = await wallet.createIdentity([
      Slip10RawIndex.hardened(0),
      Slip10RawIndex.hardened(1),
    ]);

    const recipientAddress = "0x43aa18FAAE961c23715735682dC75662d90F4DDe" as Address;

    const sendTx: SendTx = {
      kind: TransactionKind.Send,
      chainId: nodeChainId,
      signer: mainIdentity.pubkey,
      recipient: recipientAddress,
      amount: {
        whole: 20,
        fractional: 0,
        tokenTicker: "ETH" as TokenTicker,
      },
      gasPrice: {
        whole: 0,
        fractional: 20000000000,
        tokenTicker: "ETH" as TokenTicker,
      },
      gasLimit: {
        whole: 0,
        fractional: 21000,
        tokenTicker: "ETH" as TokenTicker,
      },
    };

    const signingJob = ethereumCodec.bytesToSign(sendTx, nonce);
    const signature = await wallet.createTransactionSignature(
      mainIdentity,
      signingJob.bytes,
      signingJob.prehashType,
      nodeChainId,
    );

    const signedTransaction = {
      transaction: sendTx,
      transactionBytes: signingJob.bytes,
      primarySignature: {
        nonce: nonce,
        publicKey: mainIdentity.pubkey,
        signature: signature,
      },
      otherSignatures: [],
    };
    const bytesToPost = ethereumCodec.bytesToPost(signedTransaction);

    const connection = await EthereumConnection.establish(base);
    const result = await connection.postTx(bytesToPost);
    expect(result).toBeTruthy();
  });
});
