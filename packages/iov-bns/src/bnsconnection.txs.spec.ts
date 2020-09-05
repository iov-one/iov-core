import {
  Account,
  BlockInfoFailed,
  BlockInfoSucceeded,
  isBlockInfoPending,
  isConfirmedAndSignedTransaction,
  isConfirmedTransaction,
  isFailedTransaction,
  isSendTransaction,
  SendTransaction,
  TransactionId,
  TransactionState,
  UnsignedTransaction,
  TokenTicker,
} from "@iov/bcp";
import { Ed25519, Sha512 } from "@iov/crypto";
import { HdPaths } from "@iov/keycontrol";
import { firstEvent, lastValue } from "@iov/stream";
import { assert, sleep } from "@iov/utils";
import Long from "long";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import {
  bnsdTendermintUrl,
  cash,
  defaultAmount,
  pendingWithoutBnsd,
  randomBnsAddress,
  sendCash,
  sendTokensFromFaucet,
  tendermintSearchIndexUpdated,
  userProfileWithFaucet,
} from "./testutils.spec";
import { identityToAddress } from "./util";

describe("BnsConnection (txs)", () => {
  describe("getTx", () => {
    it("can get a transaction by ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);

      // by non-existing ID
      {
        const nonExistentId = "abcd" as TransactionId;
        await connection
          .getTx(nonExistentId)
          .then(fail.bind(null, "should not resolve"), (error) =>
            expect(error).toMatch(/transaction does not exist/i),
          );
      }

      {
        const chainId = connection.chainId;
        const { profile, faucet } = await userProfileWithFaucet(chainId);
        const faucetAddress = bnsCodec.identityToAddress(faucet);

        const memo = `Payment ${Math.random()}`;
        const sendTx = await connection.withDefaultFee<SendTransaction>(
          {
            kind: "bcp/send",
            chainId: faucet.chainId,
            sender: faucetAddress,
            recipient: await randomBnsAddress(),
            memo: memo,
            amount: defaultAmount,
          },
          faucetAddress,
        );

        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));
        const transactionId = response.transactionId;

        await tendermintSearchIndexUpdated();

        const result = await connection.getTx(transactionId);
        expect(result.height).toBeGreaterThanOrEqual(2);
        expect(result.transactionId).toEqual(transactionId);
        assert(isConfirmedTransaction(result), "Expected ConfirmedTransaction");
        const transaction = result.transaction;
        assert(isSendTransaction(transaction), "Expected SendTransaction");
        expect(transaction.recipient).toEqual(sendTx.recipient);
        expect(transaction.amount).toEqual(defaultAmount);
      }

      connection.disconnect();
    });

    it("can get a transaction by ID and verify its signature", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId;
      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddress = bnsCodec.identityToAddress(faucet);

      const memo = `Payment ${Math.random()}`;
      const sendTx = {
        kind: "bcp/send",
        chainId: faucet.chainId,
        sender: faucetAddress,
        recipient: await randomBnsAddress(),
        memo: memo,
        amount: defaultAmount,
        fee: {
          tokens: { quantity: '500000000', fractionalDigits: 9, tokenTicker: 'CASH' as TokenTicker },
          payer: faucetAddress
        }
      };


      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(faucet, sendTx as UnsignedTransaction, bnsCodec, nonce);
      console.log(signed);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));
      const transactionId = response.transactionId;

      await tendermintSearchIndexUpdated();

      const result = await connection.getTx(transactionId);
      assert(isConfirmedTransaction(result), "Expected ConfirmedTransaction");
      const {
        transaction,
        signatures: [signature],
      } = result;
      assert(isSendTransaction(transaction), "Expected SendTransaction");
      const signingJob = bnsCodec.bytesToSign(transaction, signature.nonce);
      const txBytes = new Sha512(signingJob.bytes).digest();
      console.log("Signature 1")
      console.log(signature.signature);
      console.log("txBytes 1")
      console.log(txBytes);
      console.log("pubKey 1");
      console.log(faucet.pubkey.data);
      const valid = await Ed25519.verifySignature(signature.signature, txBytes, faucet.pubkey.data);

      
      
      const signingJob2 = bnsCodec.bytesToSign(sendTx, signed.signatures[0].nonce);
      const txBytes2 = new Sha512(signingJob2.bytes).digest();
      console.log("Signature 1")
      console.log(signed.signatures[0].signature);
      console.log("txBytes 2")
      console.log(txBytes2);
      console.log("pubKey 2");
      console.log(signed.signatures[0].pubkey.data);

      // 1 Signature 
      // 2 txBytes  X
      // 3 pubkey

      const valid2 = await Ed25519.verifySignature(signed.signatures[0].signature, txBytes2, signed.signatures[0].pubkey.data);
      expect(valid2).toBe(true);

      connection.disconnect();
    });
  });
});
