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
      assert(isConfirmedTransaction(result), "Expected ConfirmedTransaction");
      const {
        transaction,
        signatures: [signature],
      } = result;
      assert(isSendTransaction(transaction), "Expected SendTransaction");
      const signingJob = bnsCodec.bytesToSign(transaction, signature.nonce);
      const txBytes = new Sha512(signingJob.bytes).digest();

      const valid = await Ed25519.verifySignature(signature.signature, txBytes, faucet.pubkey.data);
      expect(valid).toBe(true);

      connection.disconnect();
    });
  });

  describe("searchTx", () => {
    it("can search for transactions by tags", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId;

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddress = bnsCodec.identityToAddress(faucet);
      const rcptAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: faucet.chainId,
          sender: faucetAddress,
          recipient: rcptAddress,
          memo: memo,
          amount: defaultAmount,
        },
        faucetAddress,
      );

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // finds transaction using tag
      const results = (await connection.searchTx({ sentFromOrTo: rcptAddress })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(results.length).toBeGreaterThanOrEqual(1);
      const mostRecentResultTransaction = results[results.length - 1].transaction;
      assert(isSendTransaction(mostRecentResultTransaction), "Expected SendTransaction");
      expect(mostRecentResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("can search for transactions by height", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId;

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddress = bnsCodec.identityToAddress(faucet);
      const rcptAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: faucet.chainId,
          sender: faucetAddress,
          recipient: rcptAddress,
          memo: memo,
          amount: defaultAmount,
        },
        faucetAddress,
      );

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));
      expect(blockInfo.state).toBe(TransactionState.Succeeded);
      const txHeight = (blockInfo as BlockInfoSucceeded | BlockInfoFailed).height;

      await tendermintSearchIndexUpdated();

      // finds transaction using height
      const results = (await connection.searchTx({ height: txHeight })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(results.length).toBeGreaterThanOrEqual(1);
      const mostRecentResultTransaction = results[results.length - 1].transaction;
      assert(isSendTransaction(mostRecentResultTransaction), "Expected SendTransaction");
      expect(mostRecentResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("can search for transactions by ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
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
      const transactionIdToSearch = response.transactionId;

      await tendermintSearchIndexUpdated();

      // finds transaction using id
      const searchResults = (await connection.searchTx({ id: transactionIdToSearch })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResults.length).toEqual(1);
      expect(searchResults[0].transactionId).toEqual(transactionIdToSearch);
      const searchResultTransaction = searchResults[0].transaction;
      assert(isSendTransaction(searchResultTransaction), "Expected SendTransaction");
      expect(searchResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    // Fixed since tendermint v0.26.4
    // see issue https://github.com/tendermint/tendermint/issues/2759
    it("can search for transactions by minHeight/maxHeight", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId;
      const initialHeight = await connection.height();

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddress = bnsCodec.identityToAddress(faucet);
      const recipientAddress = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const memo = `Payment ${Math.random()}`;
      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: faucet.chainId,
          sender: faucetAddress,
          recipient: recipientAddress,
          memo: memo,
          amount: defaultAmount,
        },
        faucetAddress,
      );

      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      {
        // finds transaction using sentFromOrTo and minHeight = 1
        const results = (await connection.searchTx({ sentFromOrTo: recipientAddress, minHeight: 1 })).filter(
          isConfirmedAndSignedTransaction,
        );
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        assert(isSendTransaction(mostRecentResultTransaction), "Expected SendTransaction");
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using sentFromOrTo and minHeight = initialHeight
        const results = (
          await connection.searchTx({
            sentFromOrTo: recipientAddress,
            minHeight: initialHeight,
          })
        ).filter(isConfirmedAndSignedTransaction);
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        assert(isSendTransaction(mostRecentResultTransaction), "Expected SendTransaction");
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using sentFromOrTo and maxHeight = 500 million
        const results = (
          await connection.searchTx({
            sentFromOrTo: recipientAddress,
            maxHeight: 500_000_000,
          })
        ).filter(isConfirmedAndSignedTransaction);
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        assert(isSendTransaction(mostRecentResultTransaction), "Expected SendTransaction");
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      {
        // finds transaction using sentFromOrTo and maxHeight = initialHeight + 10
        const results = (
          await connection.searchTx({
            sentFromOrTo: recipientAddress,
            maxHeight: initialHeight + 10,
          })
        ).filter(isConfirmedAndSignedTransaction);
        expect(results.length).toBeGreaterThanOrEqual(1);
        const mostRecentResultTransaction = results[results.length - 1].transaction;
        assert(isSendTransaction(mostRecentResultTransaction), "Expected SendTransaction");
        expect(mostRecentResultTransaction.memo).toEqual(memo);
      }

      connection.disconnect();
    });

    it("reports DeliverTx errors for search by ID", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId;
      const initialHeight = await connection.height();

      const { profile, walletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(walletId, chainId, HdPaths.iov(1234));
      const brokeAddress = bnsCodec.identityToAddress(brokeIdentity);

      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: chainId,
          sender: brokeAddress,
          recipient: await randomBnsAddress(),
          memo: "Sending from empty",
          amount: defaultAmount,
        },
        brokeAddress,
      );

      // give the broke Identity just enough to pay the fee
      await sendTokensFromFaucet(connection, identityToAddress(brokeIdentity), sendTx.fee!.tokens);

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(brokeIdentity, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;
      await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      const results = await connection.searchTx({ id: transactionIdToSearch });

      expect(results.length).toEqual(1);
      const result = results[0];
      assert(isFailedTransaction(result), "Expected FailedTransaction");
      expect(result.height).toBeGreaterThan(initialHeight);
      // https://github.com/iov-one/weave/blob/v0.15.0/errors/errors.go#L52
      expect(result.code).toEqual(13);
      expect(result.message).toMatch(/invalid amount/i);

      connection.disconnect();
    });
  });

  describe("listenTx", () => {
    it("can listen to transactions by hash", (done) => {
      pendingWithoutBnsd();

      (async () => {
        const connection = await BnsConnection.establish(bnsdTendermintUrl);
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
        const transactionId = bnsCodec.identifier(signed);
        const heightBeforeTransaction = await connection.height();

        // start listening
        const subscription = connection.listenTx({ id: transactionId }).subscribe({
          next: (event) => {
            if (!isConfirmedTransaction(event)) {
              done.fail("Confirmed transaction expected");
              return;
            }

            expect(event.transactionId).toEqual(transactionId);
            expect(event.height).toEqual(heightBeforeTransaction + 1);

            subscription.unsubscribe();
            connection.disconnect();
            done();
          },
          complete: () => done.fail("Stream completed before we are done"),
          error: done.fail,
        });

        // post transaction
        await connection.postTx(bnsCodec.bytesToPost(signed));
      })().catch(done.fail);
    });
  });

  describe("liveTx", () => {
    it("finds an existing transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
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
      const transactionIdToSearch = response.transactionId;
      await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      // finds transaction using id
      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      assert(isConfirmedTransaction(result), "Expected ConfirmedTransaction");
      const searchResultTransaction = result.transaction;
      expect(result.transactionId).toEqual(transactionIdToSearch);
      assert(isSendTransaction(searchResultTransaction), "Expected SendTransaction");
      expect(searchResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("can wait for a future transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
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
      const transactionIdToSearch = response.transactionId;

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      assert(isConfirmedTransaction(result), "Expected ConfirmedTransaction");
      const searchResultTransaction = result.transaction;
      expect(result.transactionId).toEqual(transactionIdToSearch);
      assert(isSendTransaction(searchResultTransaction), "Expected SendTransaction");
      expect(searchResultTransaction.memo).toEqual(memo);

      connection.disconnect();
    });

    it("reports DeliverTx error for an existing transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId;
      const initialHeight = await connection.height();

      const { profile, walletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(walletId, chainId, HdPaths.iov(1234));
      const brokeAddress = bnsCodec.identityToAddress(brokeIdentity);

      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: chainId,
          sender: brokeAddress,
          recipient: await randomBnsAddress(),
          memo: "Sending from empty",
          amount: defaultAmount,
        },
        brokeAddress,
      );

      // give the broke Identity just enough to pay the fee
      await sendTokensFromFaucet(connection, identityToAddress(brokeIdentity), sendTx.fee!.tokens);

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(brokeIdentity, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;
      await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));

      await tendermintSearchIndexUpdated();

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      assert(isFailedTransaction(result), "Expected FailedTransaction");
      expect(result.height).toBeGreaterThan(initialHeight);
      // https://github.com/iov-one/weave/blob/v0.15.0/errors/errors.go#L52
      expect(result.code).toEqual(13);
      expect(result.message).toMatch(/invalid amount/i);

      connection.disconnect();
    });

    it("reports DeliverTx error for a future transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId;

      const { profile, walletId } = await userProfileWithFaucet(chainId);
      // this will never have tokens, but can try to sign
      const brokeIdentity = await profile.createIdentity(walletId, chainId, HdPaths.iov(1234));
      const brokeAddress = bnsCodec.identityToAddress(brokeIdentity);

      // Sending tokens from an empty account will trigger a failure in DeliverTx
      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: chainId,
          sender: brokeAddress,
          recipient: await randomBnsAddress(),
          memo: "Sending from empty",
          amount: defaultAmount,
        },
        brokeAddress,
      );

      // give the broke Identity just enough to pay the fee
      await sendTokensFromFaucet(connection, identityToAddress(brokeIdentity), sendTx.fee!.tokens);

      const nonce = await connection.getNonce({ pubkey: brokeIdentity.pubkey });
      const signed = await profile.signTransaction(brokeIdentity, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const transactionIdToSearch = response.transactionId;

      const result = await firstEvent(connection.liveTx({ id: transactionIdToSearch }));

      assert(isFailedTransaction(result), "Expected FailedTransaction");
      // https://github.com/iov-one/weave/blob/v0.15.0/errors/errors.go#L52
      expect(result.code).toEqual(13);
      expect(result.message).toMatch(/invalid amount/i);

      connection.disconnect();
    });
  });

  // make sure we can get a reactive account balance (as well as nonce)
  it("can watch accounts", async () => {
    pendingWithoutBnsd();
    const connection = await BnsConnection.establish(bnsdTendermintUrl);
    const { profile, faucet } = await userProfileWithFaucet(connection.chainId);
    const recipientAddr = await randomBnsAddress();

    // watch account by pubkey and by address
    const faucetAccountStream = connection.watchAccount({ pubkey: faucet.pubkey });
    const recipientAccountStream = connection.watchAccount({ address: recipientAddr });

    // let's watch for all changes, capture them in a value sink
    const faucetAcct = lastValue<Account | undefined>(faucetAccountStream);
    const rcptAcct = lastValue<Account | undefined>(recipientAccountStream);

    // give it a chance to get initial feed before checking and proceeding
    await sleep(200);

    // make sure there are original values sent on the wire
    expect(rcptAcct.value()).toBeUndefined();
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.balance.length).toEqual(2);
    const faucetStartBalance = faucetAcct.value()!.balance.find(({ tokenTicker }) => tokenTicker === cash)!;

    // send some cash
    const post = await sendCash(connection, profile, faucet, recipientAddr);
    await post.blockInfo.waitFor((info) => !isBlockInfoPending(info));

    // give it a chance to get updates before checking and proceeding
    await sleep(100);

    // rcptAcct should now have a value
    expect(rcptAcct.value()).toBeDefined();
    expect(rcptAcct.value()!.balance.length).toEqual(1);
    expect(rcptAcct.value()!.balance.find(({ tokenTicker }) => tokenTicker === cash)!.quantity).toEqual(
      "68000000000",
    );

    // facuetAcct should have gone down a bit
    expect(faucetAcct.value()).toBeDefined();
    expect(faucetAcct.value()!.balance.length).toEqual(2);
    const faucetEndBalance = faucetAcct.value()!.balance.find(({ tokenTicker }) => tokenTicker === cash)!;
    expect(faucetEndBalance).not.toEqual(faucetStartBalance);
    expect(faucetEndBalance.quantity).toEqual(
      Long.fromString(faucetStartBalance.quantity)
        .subtract(68_000000000)
        .subtract(0_010000000) // the fee (0.01 CASH)
        .toString(),
    );

    connection.disconnect();
  });
});
