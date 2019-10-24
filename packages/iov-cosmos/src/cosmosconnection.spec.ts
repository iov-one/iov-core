import {
  Address,
  Algorithm,
  ChainId,
  isFailedTransaction,
  isSendTransaction,
  PubkeyBytes,
  SendTransaction,
  TokenTicker,
  WithCreator,
} from "@iov/bcp";
import { Secp256k1 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { HdPaths, Secp256k1HdWallet, UserProfile } from "@iov/keycontrol";

import { cosmosCodec } from "./cosmoscodec";
import { CosmosConnection } from "./cosmosconnection";

const { fromBase64, toHex } = Encoding;

function pendingWithoutCosmos(): void {
  if (!process.env.COSMOS_ENABLED) {
    return pending("Set COSMOS_ENABLED to enable Cosmos node-based tests");
  }
}

describe("CosmosConnection", () => {
  const vatom = "vatom" as TokenTicker;
  const httpUrl = "http://localhost:1317";
  const defaultChainId = "testing" as ChainId;
  const defaultEmptyAddress = "cosmos1h806c7khnvmjlywdrkdgk2vrayy2mmvf9rxk2r" as Address;
  const defaultAddress = "cosmos1pkptre7fdkl6gfrzlesjjvhxhlc3r4gmmk8rs6" as Address;
  const defaultPubkey = {
    algo: Algorithm.Secp256k1,
    data: fromBase64("A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ") as PubkeyBytes,
  };
  const faucetMnemonic =
    "economy stock theory fatal elder harbor betray wasp final emotion task crumble siren bottom lizard educate guess current outdoor pair theory focus wife stone";
  const faucetPath = HdPaths.cosmos(0);
  const defaultRecipient = "cosmos1t70qnpr0az8tf7py83m4ue5y89w58lkjmx0yq2" as Address;

  describe("establish", () => {
    it("can connect to Cosmos via http", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      expect(connection).toBeTruthy();
      connection.disconnect();
    });
  });

  describe("chainId", () => {
    it("displays the chain ID", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const chainId = connection.chainId();
      expect(chainId).toEqual(defaultChainId);
      connection.disconnect();
    });
  });

  describe("height", () => {
    it("displays the current height", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const height = await connection.height();
      expect(height).toBeGreaterThan(0);
      connection.disconnect();
    });
  });

  describe("getAccount", () => {
    it("gets an empty account by address", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const account = await connection.getAccount({ address: defaultEmptyAddress });
      expect(account).toBeUndefined();
      connection.disconnect();
    });

    it("gets an account by address", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const account = await connection.getAccount({ address: defaultAddress });
      if (account === undefined) {
        throw new Error("Expected account not to be undefined");
      }
      expect(account.address).toEqual(defaultAddress);
      expect(account.pubkey).toEqual(defaultPubkey);
      expect(account.balance.length).toEqual(2);
      connection.disconnect();
    });

    it("gets an account by pubkey", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const account = await connection.getAccount({ pubkey: defaultPubkey });
      if (account === undefined) {
        throw new Error("Expected account not to be undefined");
      }
      expect(account.address).toEqual(defaultAddress);
      expect(account.pubkey).toEqual({
        algo: Algorithm.Secp256k1,
        data: fromBase64("A08EGB7ro1ORuFhjOnZcSgwYlpe0DSFjVNUIkNNQxwKQ"),
      });
      expect(account.balance.length).toEqual(2);
      connection.disconnect();
    });
  });

  describe("integration: postTx and getTx", () => {
    it("can post and get a transaction", async () => {
      pendingWithoutCosmos();
      const connection = await CosmosConnection.establish(httpUrl);
      const profile = new UserProfile();
      const wallet = profile.addWallet(Secp256k1HdWallet.fromMnemonic(faucetMnemonic));
      const faucet = await profile.createIdentity(wallet.id, defaultChainId, faucetPath);
      const faucetAddress = cosmosCodec.identityToAddress(faucet);

      const unsigned = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: faucetAddress,
        recipient: defaultRecipient,
        memo: "My first payment",
        amount: {
          quantity: "75000",
          fractionalDigits: 9,
          tokenTicker: vatom,
        },
      });
      const nonce = await connection.getNonce({ address: faucetAddress });
      const signed = await profile.signTransaction(unsigned, cosmosCodec, nonce);
      const postableBytes = cosmosCodec.bytesToPost(signed);
      const { transactionId } = await connection.postTx(postableBytes);

      const getResponse = await connection.getTx(transactionId);
      expect(getResponse).toBeTruthy();
      expect(getResponse.transactionId).toEqual(transactionId);
      if (isFailedTransaction(getResponse)) {
        throw new Error("Expected transaction to succeed");
      }
      expect(getResponse.log).toMatch(/success/i);
      const { transaction, primarySignature, otherSignatures } = getResponse;
      if (!isSendTransaction(transaction)) {
        throw new Error("Expected send transaction");
      }
      expect(transaction.kind).toEqual(unsigned.kind);
      expect(transaction.sender).toEqual(unsigned.sender);
      expect(transaction.recipient).toEqual(unsigned.recipient);
      expect(transaction.memo).toEqual(unsigned.memo);
      expect(transaction.amount).toEqual(unsigned.amount);
      expect(transaction.creator.chainId).toEqual(unsigned.creator.chainId);
      expect(transaction.creator.pubkey.algo).toEqual(unsigned.creator.pubkey.algo);
      expect(toHex(transaction.creator.pubkey.data)).toEqual(
        toHex(Secp256k1.compressPubkey(unsigned.creator.pubkey.data)),
      );

      // TODO: Enable when Cosmos-SDK supports this
      // See https://github.com/cosmos/cosmos-sdk/issues/4713
      // expect(primarySignature.nonce).toEqual(signed.primarySignature.nonce);
      expect(primarySignature.pubkey.algo).toEqual(signed.primarySignature.pubkey.algo);
      expect(toHex(primarySignature.pubkey.data)).toEqual(
        toHex(Secp256k1.compressPubkey(signed.primarySignature.pubkey.data)),
      );
      expect(toHex(primarySignature.signature)).toEqual(
        toHex(Secp256k1.trimRecoveryByte(signed.primarySignature.signature)),
      );
      expect(otherSignatures).toEqual(signed.otherSignatures);

      connection.disconnect();
    });
  });
});