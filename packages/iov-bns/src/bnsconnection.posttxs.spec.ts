import {
  BlockInfo,
  ChainId,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isConfirmedTransaction,
  isSendTransaction,
  SendTransaction,
  TokenTicker,
  TransactionState,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";
import BN from "bn.js";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { decodeNumericId } from "./decode";
import {
  bash,
  bnsdTendermintUrl,
  cash,
  defaultAmount,
  getRandomInteger,
  pendingWithoutBnsd,
  randomBnsAddress,
  registerAmount,
  sendTokensFromFaucet,
  sleep,
  tendermintSearchIndexUpdated,
  unusedAddress,
  userProfileWithFaucet,
} from "./testutils.spec";
import {
  ActionKind,
  CreateEscrowTx,
  CreateMultisignatureTx,
  CreateProposalTx,
  CreateTextResolutionAction,
  isCreateEscrowTx,
  isCreateMultisignatureTx,
  isRegisterUsernameTx,
  isReleaseEscrowTx,
  isReturnEscrowTx,
  isUpdateEscrowPartiesTx,
  isUpdateMultisignatureTx,
  Participant,
  ProposalExecutorResult,
  ProposalResult,
  ProposalStatus,
  RegisterUsernameTx,
  ReleaseEscrowTx,
  ReturnEscrowTx,
  SetMsgFeeAction,
  TransferUsernameTx,
  UpdateEscrowPartiesTx,
  UpdateMultisignatureTx,
  UpdateTargetsOfUsernameTx,
  VoteOption,
  VoteTx,
} from "./types";
import { encodeBnsAddress, identityToAddress } from "./util";

const { fromHex } = Encoding;

describe("BnsConnection (txs)", () => {
  describe("postTx", () => {
    it("can send transaction", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();
      const initialHeight = await connection.height();

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddr = identityToAddress(faucet);
      const recipient = await randomBnsAddress();

      // construct a sendtx, this is normally used in the MultiChainSigner api
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: recipient,
        memo: "My first payment",
        amount: {
          quantity: "5000075000",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
      });
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
      const txBytes = bnsCodec.bytesToPost(signed);
      const response = await connection.postTx(txBytes);
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      // we should be a little bit richer
      const updatedAccount = await connection.getAccount({ address: recipient });
      expect(updatedAccount).toBeDefined();
      const paid = updatedAccount!;
      expect(paid.balance.length).toEqual(1);
      expect(paid.balance[0].quantity).toEqual("5000075000");

      // and the nonce should go up, to be at least one
      // (worrying about replay issues)
      const fNonce = await connection.getNonce({ pubkey: faucet.pubkey });
      expect(fNonce).toBeGreaterThanOrEqual(1);

      await tendermintSearchIndexUpdated();

      // now verify we can query the same tx back
      const search = (await connection.searchTx({ sentFromOrTo: faucetAddr })).filter(isConfirmedTransaction);
      expect(search.length).toBeGreaterThanOrEqual(1);
      // make sure we get a valid signature
      const mine = search[search.length - 1];
      // make sure we have a txid
      expect(mine.height).toBeGreaterThan(initialHeight);
      expect(mine.transactionId).toMatch(/^[0-9A-F]{64}$/);
      const tx = mine.transaction;
      if (!isSendTransaction(tx)) {
        throw new Error("Expected send transaction");
      }
      expect(tx).toEqual(sendTx);

      connection.disconnect();
    });

    // TODO: extend this with missing and high fees
    it("rejects send transaction with manual fees too low", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);

      const sendTx: SendTransaction & WithCreator = {
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        memo: "This time I pay my bills",
        amount: {
          quantity: "100",
          fractionalDigits: 9,
          tokenTicker: cash,
        },
        fee: {
          tokens: {
            quantity: "2",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        },
      };
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
      try {
        await connection.postTx(bnsCodec.bytesToPost(signed));
        fail("above line should reject with low fees");
      } catch (err) {
        expect(err).toMatch(/fee less than minimum/);
      }
      connection.disconnect();
    });

    it("reports post errors (CheckTx)", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);

      // memo too long will trigger failure in CheckTx (validation of message)
      const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
        kind: "bcp/send",
        creator: faucet,
        sender: bnsCodec.identityToAddress(faucet),
        recipient: await randomBnsAddress(),
        amount: {
          ...defaultAmount,
          tokenTicker: "UNKNOWN" as TokenTicker,
        },
      });
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);

      await connection
        .postTx(bnsCodec.bytesToPost(signed))
        .then(
          () => fail("promise must be rejected"),
          error => expect(error).toMatch(/field \\"Amount\\": invalid currency: UNKNOWN/i),
        );

      connection.disconnect();
    });

    it("can post transaction and watch confirmations", done => {
      pendingWithoutBnsd();

      (async () => {
        const connection = await BnsConnection.establish(bnsdTendermintUrl);
        const chainId = connection.chainId();

        const { profile, faucet } = await userProfileWithFaucet(chainId);
        const recipient = await randomBnsAddress();

        // construct a sendtx, this is normally used in the MultiChainSigner api
        const sendTx = await connection.withDefaultFee<SendTransaction & WithCreator>({
          kind: "bcp/send",
          creator: faucet,
          sender: bnsCodec.identityToAddress(faucet),
          recipient: recipient,
          memo: "My first payment",
          amount: {
            quantity: "5000075000",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        });
        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(sendTx, bnsCodec, nonce);
        const heightBeforeTransaction = await connection.height();
        const result = await connection.postTx(bnsCodec.bytesToPost(signed));
        expect(result.blockInfo.value).toEqual({ state: TransactionState.Pending });

        const events = new Array<BlockInfo>();
        const subscription = result.blockInfo.updates.subscribe({
          next: info => {
            events.push(info);

            if (events.length === 3) {
              expect(events[0]).toEqual({
                state: TransactionState.Pending,
              });
              expect(events[1]).toEqual({
                state: TransactionState.Succeeded,
                height: heightBeforeTransaction + 1,
                confirmations: 1,
                result: undefined,
              });
              expect(events[2]).toEqual({
                state: TransactionState.Succeeded,
                height: heightBeforeTransaction + 1,
                confirmations: 2,
                result: undefined,
              });

              subscription.unsubscribe();
              connection.disconnect();
              done();
            }
          },
          complete: done.fail,
          error: done.fail,
        });
      })().catch(done.fail);
    });

    it("can register a username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));

      // we need funds to pay the fees
      const address = identityToAddress(identity);
      await sendTokensFromFaucet(connection, address, registerAmount);

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const registration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: [{ chainId: "foobar" as ChainId, address: address }],
      });
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(registration, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = (await connection.searchTx({ signedBy: address })).filter(isConfirmedTransaction);
      expect(searchResult.length).toEqual(1);
      const firstSearchResultTransaction = searchResult[0].transaction;
      if (!isRegisterUsernameTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.username).toEqual(username);
      expect(firstSearchResultTransaction.targets.length).toEqual(1);

      connection.disconnect();
    });

    it("can register a username with empty list of targets", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));

      // we need funds to pay the fees
      const address = identityToAddress(identity);
      await sendTokensFromFaucet(connection, address, registerAmount);

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const registration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: [],
      });
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(registration, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = (await connection.searchTx({ signedBy: address })).filter(isConfirmedTransaction);
      expect(searchResult.length).toEqual(1);
      const firstSearchResultTransaction = searchResult[0].transaction;
      if (!isRegisterUsernameTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.username).toEqual(username);
      expect(firstSearchResultTransaction.targets.length).toEqual(0);

      connection.disconnect();
    });

    it("can update targets of username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));
      // we need funds to pay the fees
      const myAddress = identityToAddress(identity);
      await sendTokensFromFaucet(connection, myAddress, registerAmount);

      const targets1 = [{ chainId: "foobar" as ChainId, address: myAddress }] as const;
      const targets2 = [{ chainId: "barfoo" as ChainId, address: myAddress }] as const;

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const usernameRegistration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: targets1,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Update targets
      const updateTargets = await connection.withDefaultFee<UpdateTargetsOfUsernameTx & WithCreator>({
        kind: "bns/update_targets_of_username",
        creator: identity,
        username: username,
        targets: targets2,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              updateTargets,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      // Clear addresses
      const clearAddresses = await connection.withDefaultFee<UpdateTargetsOfUsernameTx & WithCreator>({
        kind: "bns/update_targets_of_username",
        creator: identity,
        username: username,
        targets: [],
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              clearAddresses,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      connection.disconnect();
    });

    it("can transfer a username", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));
      // we need funds to pay the fees
      const myAddress = identityToAddress(identity);
      await sendTokensFromFaucet(connection, myAddress, registerAmount);

      const targets1 = [{ chainId: "foobar" as ChainId, address: myAddress }] as const;

      // Create and send registration
      const username = `testuser_${Math.random()}*iov`;
      const usernameRegistration = await connection.withDefaultFee<RegisterUsernameTx & WithCreator>({
        kind: "bns/register_username",
        creator: identity,
        username: username,
        targets: targets1,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      const transferUsername = await connection.withDefaultFee<TransferUsernameTx & WithCreator>({
        kind: "bns/transfer_username",
        creator: identity,
        username: username,
        newOwner: unusedAddress,
      });
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              transferUsername,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      const usernameAfterTransfer = (await connection.getUsernames({ username: username }))[0];
      expect(usernameAfterTransfer.owner).toEqual(unusedAddress);

      connection.disconnect();
    });

    it("can create and update a multisignature account", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const identity = await profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(0));

      // we need funds to pay the fees
      const address = identityToAddress(identity);
      await sendTokensFromFaucet(connection, address, registerAmount);

      // Create multisignature
      const otherIdentities = await Promise.all(
        [10, 11, 12, 13, 14].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const participants: readonly Participant[] = [identity, ...otherIdentities].map((id, i) => ({
        address: identityToAddress(id),
        weight: i === 0 ? 5 : 1,
      }));
      const tx1 = await connection.withDefaultFee<CreateMultisignatureTx & WithCreator>({
        kind: "bns/create_multisignature_contract",
        creator: identity,
        participants: participants,
        activationThreshold: 4,
        adminThreshold: 5,
      });
      const nonce1 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: address })).filter(isConfirmedTransaction);
      expect(searchResult1.length).toEqual(1);
      const { result: contractId, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateMultisignatureTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.participants.length).toEqual(6);
      firstSearchResultTransaction.participants.forEach((participant, i) => {
        expect(participant.address).toEqual(participants[i].address);
        expect(participant.weight).toEqual(participants[i].weight);
      });
      expect(firstSearchResultTransaction.activationThreshold).toEqual(4);
      expect(firstSearchResultTransaction.adminThreshold).toEqual(5);
      expect(contractId).toBeDefined();

      // Update multisignature
      const participantsUpdated: readonly Participant[] = (await Promise.all(
        [15, 16, 17].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      )).map(id => ({
        address: identityToAddress(id),
        weight: 6,
      }));
      const tx2 = await connection.withDefaultFee<UpdateMultisignatureTx & WithCreator>({
        kind: "bns/update_multisignature_contract",
        creator: identity,
        contractId: contractId!,
        participants: participantsUpdated,
        activationThreshold: 2,
        adminThreshold: 6,
      });
      const nonce2 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction2
      const searchResult2 = (await connection.searchTx({ signedBy: address })).filter(isConfirmedTransaction);
      expect(searchResult2.length).toEqual(2);
      const { transaction: secondSearchResultTransaction } = searchResult2[1];
      if (!isUpdateMultisignatureTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.participants.length).toEqual(3);
      secondSearchResultTransaction.participants.forEach((participant, i) => {
        expect(participant.address).toEqual(participantsUpdated[i].address);
        expect(participant.weight).toEqual(participantsUpdated[i].weight);
      });
      expect(secondSearchResultTransaction.activationThreshold).toEqual(2);
      expect(secondSearchResultTransaction.adminThreshold).toEqual(6);
      expect(contractId).toBeDefined();

      connection.disconnect();
    });

    it("can create and release an escrow", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const [sender, recipient, arbiter] = await Promise.all(
        [0, 10, 20].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const [senderAddress, recipientAddress, arbiterAddress] = [sender, recipient, arbiter].map(
        identityToAddress,
      );
      const timeout = {
        timestamp: Math.floor(Date.now() / 1000) + 3000,
      };
      const memo = "testing 123";

      // we need funds to pay the fees
      await sendTokensFromFaucet(connection, senderAddress, registerAmount);
      await sendTokensFromFaucet(connection, arbiterAddress, registerAmount);

      // Create escrow
      const tx1 = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
        kind: "bns/create_escrow",
        creator: sender,
        sender: senderAddress,
        arbiter: arbiterAddress,
        recipient: recipientAddress,
        amounts: [defaultAmount],
        timeout: timeout,
        memo: memo,
      });
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateEscrowTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Release escrow
      const tx2 = await connection.withDefaultFee<ReleaseEscrowTx & WithCreator>({
        kind: "bns/release_escrow",
        creator: arbiter,
        escrowId: escrowId,
        amounts: [defaultAmount],
      });
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      if (!isReleaseEscrowTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.escrowId).toEqual(escrowId);
      expect(secondSearchResultTransaction.amounts).toEqual([defaultAmount]);

      connection.disconnect();
    });

    it("any account can return an escrow (after the timeout)", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));

      let escrowId: Uint8Array;
      {
        const sender = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(0));
        const senderAddress = identityToAddress(sender);
        await sendTokensFromFaucet(connection, senderAddress, registerAmount);

        const timeout = Math.floor(Date.now() / 1000) + 3;

        const createEscrowTx = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
          kind: "bns/create_escrow",
          creator: sender,
          sender: senderAddress,
          arbiter: encodeBnsAddress("tiov", fromHex("0000000000000000000000000000000000000000")),
          recipient: encodeBnsAddress("tiov", fromHex("0000000000000000000000000000000000000000")),
          amounts: [defaultAmount],
          timeout: { timestamp: timeout },
        });

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(createEscrowTx, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) throw new Error("Transaction did not succeed");
        escrowId = blockInfo.result || fromHex("");
      }

      await sleep(5_000);

      {
        // Use an external helper account (random path from random wallet) that returns the escrow for source
        const addressIndex = getRandomInteger(100, 2 ** 31);
        const helperIdentity = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(addressIndex));
        const helperAddress = identityToAddress(helperIdentity);
        await sendTokensFromFaucet(connection, helperAddress);

        const returnEscrowTx = await connection.withDefaultFee<ReturnEscrowTx & WithCreator>({
          kind: "bns/return_escrow",
          creator: helperIdentity,
          escrowId: decodeNumericId(escrowId),
        });

        const nonce = await connection.getNonce({ pubkey: helperIdentity.pubkey });
        const signed = await profile.signTransaction(returnEscrowTx, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }
    });

    it("can create and return an escrow", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const [sender, recipient, arbiter] = await Promise.all(
        [0, 10, 20].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const [senderAddress, recipientAddress, arbiterAddress] = [sender, recipient, arbiter].map(
        identityToAddress,
      );
      const timeout = {
        timestamp: Math.floor(Date.now() / 1000) + 3,
      };
      const memo = "testing 123";

      // we need funds to pay the fees
      await sendTokensFromFaucet(connection, senderAddress, registerAmount);
      await sendTokensFromFaucet(connection, arbiterAddress, registerAmount);

      // Create escrow
      const tx1 = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
        kind: "bns/create_escrow",
        creator: sender,
        sender: senderAddress,
        arbiter: arbiterAddress,
        recipient: recipientAddress,
        amounts: [defaultAmount],
        timeout: timeout,
        memo: memo,
      });
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateEscrowTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Wait for timeout to pass
      await sleep(7000);

      // Return escrow
      const tx2 = await connection.withDefaultFee<ReturnEscrowTx & WithCreator>({
        kind: "bns/return_escrow",
        creator: arbiter,
        escrowId: escrowId,
      });
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      if (!isReturnEscrowTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.escrowId).toEqual(escrowId);

      connection.disconnect();
    });

    it("can create and update an escrow", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const registryChainId = connection.chainId();

      const profile = new UserProfile();
      const wallet = profile.addWallet(Ed25519HdWallet.fromEntropy(Random.getBytes(32)));
      const [sender, recipient, arbiter, newArbiter] = await Promise.all(
        [0, 10, 20, 21].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
      );
      const [senderAddress, recipientAddress, arbiterAddress, newArbiterAddress] = [
        sender,
        recipient,
        arbiter,
        newArbiter,
      ].map(identityToAddress);
      const timeout = {
        timestamp: Math.floor(Date.now() / 1000) + 3000,
      };
      const memo = "testing 123";

      // we need funds to pay the fees
      await sendTokensFromFaucet(connection, senderAddress, registerAmount);
      await sendTokensFromFaucet(connection, arbiterAddress, registerAmount);

      // Create escrow
      const tx1 = await connection.withDefaultFee<CreateEscrowTx & WithCreator>({
        kind: "bns/create_escrow",
        creator: sender,
        sender: senderAddress,
        arbiter: arbiterAddress,
        recipient: recipientAddress,
        amounts: [defaultAmount],
        timeout: timeout,
        memo: memo,
      });
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      if (!isCreateEscrowTx(firstSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Update escrow
      const tx2 = await connection.withDefaultFee<UpdateEscrowPartiesTx & WithCreator>({
        kind: "bns/update_escrow_parties",
        creator: arbiter,
        escrowId: escrowId,
        arbiter: newArbiterAddress,
      });
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      if (!isUpdateEscrowPartiesTx(secondSearchResultTransaction)) {
        throw new Error("Unexpected transaction kind");
      }
      expect(secondSearchResultTransaction.escrowId).toEqual(escrowId);
      expect(secondSearchResultTransaction.arbiter).toEqual(newArbiterAddress);

      connection.disconnect();
    });

    it("can create and vote on a proposal", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, admin: author } = await userProfileWithFaucet(chainId);
      const authorAddress = identityToAddress(author);

      const someElectionRule = (await connection.getElectionRules()).find(
        // Dictatorship electorate
        ({ electorateId }) => electorateId === 2,
      );
      if (!someElectionRule) {
        throw new Error("No election rule found");
      }
      const startTime = Math.floor(Date.now() / 1000) + 3;

      const title = `Hello ${Math.random()}`;
      const description = `Hello ${Math.random()}`;
      const action: CreateTextResolutionAction = {
        kind: ActionKind.CreateTextResolution,
        resolution: `The winner is Alice ${Math.random()}`,
      };
      let proposalId: number;

      {
        const createProposal = await connection.withDefaultFee<CreateProposalTx & WithCreator>({
          kind: "bns/create_proposal",
          creator: author,
          title: title,
          description: description,
          author: authorAddress,
          electionRuleId: someElectionRule.id,
          action: action,
          startTime: startTime,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(createProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) {
          throw new Error("Transaction did not succeed");
        }
        if (!blockInfo.result) {
          throw new Error("Transaction result missing");
        }
        proposalId = new BN(blockInfo.result).toNumber();
      }

      {
        // Election submitted, voting period not yet started
        const proposal = (await connection.getProposals()).find(p => p.id === proposalId)!;
        expect(proposal.votingStartTime).toBeGreaterThan(Date.now() / 1000);
        expect(proposal.state.totalYes).toEqual(0);
        expect(proposal.state.totalNo).toEqual(0);
        expect(proposal.state.totalAbstain).toEqual(0);
        expect(proposal.status).toEqual(ProposalStatus.Submitted);
        expect(proposal.result).toEqual(ProposalResult.Undefined);
        expect(proposal.executorResult).toEqual(ProposalExecutorResult.NotRun);
      }

      await sleep(6_000);

      {
        // Election submitted, voting period started
        const proposal = (await connection.getProposals()).find(p => p.id === proposalId)!;
        expect(proposal.votingStartTime).toBeLessThan(Date.now() / 1000);
        expect(proposal.votingEndTime).toBeGreaterThan(Date.now() / 1000);
        expect(proposal.state.totalYes).toEqual(0);
        expect(proposal.state.totalNo).toEqual(0);
        expect(proposal.state.totalAbstain).toEqual(0);
        expect(proposal.status).toEqual(ProposalStatus.Submitted);
        expect(proposal.result).toEqual(ProposalResult.Undefined);
        expect(proposal.executorResult).toEqual(ProposalExecutorResult.NotRun);
      }

      {
        const voteForProposal = await connection.withDefaultFee<VoteTx & WithCreator>({
          kind: "bns/vote",
          creator: author,
          proposalId: proposalId,
          selection: VoteOption.Yes,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(voteForProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      }

      await sleep(15_000);

      {
        // Election ended, was tallied automatically and is accepted
        const proposal = (await connection.getProposals()).find(p => p.id === proposalId)!;
        expect(proposal.state.totalYes).toEqual(10);
        expect(proposal.state.totalNo).toEqual(0);
        expect(proposal.state.totalAbstain).toEqual(0);
        expect(proposal.status).toEqual(ProposalStatus.Closed);
        expect(proposal.result).toEqual(ProposalResult.Accepted);
        expect(proposal.executorResult).toEqual(ProposalExecutorResult.Succeeded);
      }

      connection.disconnect();
    }, 30_000);

    it("can create and vote on a proposal, and see the effects", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, admin: author } = await userProfileWithFaucet(chainId);
      const authorAddress = identityToAddress(author);

      const someElectionRule = (await connection.getElectionRules()).find(
        // Dictatorship electorate
        ({ electorateId }) => electorateId === 2,
      );
      if (!someElectionRule) {
        throw new Error("No election rule found");
      }

      const fee1 = {
        fractionalDigits: 9,
        quantity: "50",
        tokenTicker: bash,
      };
      let proposalId1: number;

      {
        const startTime = Math.floor(Date.now() / 1000) + 3;
        const title = `Hello ${Math.random()}`;
        const description = `Hello ${Math.random()}`;
        const action: SetMsgFeeAction = {
          kind: ActionKind.SetMsgFee,
          msgPath: "username/register_token",
          fee: fee1,
        };
        const createProposal = await connection.withDefaultFee<CreateProposalTx & WithCreator>({
          kind: "bns/create_proposal",
          creator: author,
          title: title,
          description: description,
          author: authorAddress,
          electionRuleId: someElectionRule.id,
          action: action,
          startTime: startTime,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(createProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) {
          throw new Error("Transaction did not succeed");
        }
        if (!blockInfo.result) {
          throw new Error("Transaction result missing");
        }
        proposalId1 = new BN(blockInfo.result).toNumber();
      }

      await sleep(6_000);

      {
        const voteForProposal = await connection.withDefaultFee<VoteTx & WithCreator>({
          kind: "bns/vote",
          creator: author,
          proposalId: proposalId1,
          selection: VoteOption.Yes,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(voteForProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) {
          throw new Error("Transaction did not succeed");
        }
      }

      await sleep(15_000);

      const registerUsernameTx: RegisterUsernameTx & UnsignedTransaction = {
        kind: "bns/register_username",
        creator: author,
        username: "TestyMcTestface",
        targets: [],
      };
      const productFee1 = await connection.getFeeQuote(registerUsernameTx);
      expect(productFee1.tokens).toEqual(fee1);

      const fee2 = {
        fractionalDigits: 9,
        quantity: "5000000000",
        tokenTicker: cash,
      };
      let proposalId2: number;

      {
        const startTime = Math.floor(Date.now() / 1000) + 3;
        const title = `Hello ${Math.random()}`;
        const description = `Hello ${Math.random()}`;
        const action: SetMsgFeeAction = {
          kind: ActionKind.SetMsgFee,
          msgPath: "username/register_token",
          fee: fee2,
        };
        const createProposal = await connection.withDefaultFee<CreateProposalTx & WithCreator>({
          kind: "bns/create_proposal",
          creator: author,
          title: title,
          description: description,
          author: authorAddress,
          electionRuleId: someElectionRule.id,
          action: action,
          startTime: startTime,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(createProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) {
          throw new Error("Transaction did not succeed");
        }
        if (!blockInfo.result) {
          throw new Error("Transaction result missing");
        }
        proposalId2 = new BN(blockInfo.result).toNumber();
      }

      await sleep(6_000);

      {
        const voteForProposal = await connection.withDefaultFee<VoteTx & WithCreator>({
          kind: "bns/vote",
          creator: author,
          proposalId: proposalId2,
          selection: VoteOption.Yes,
        });
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(voteForProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        if (!isBlockInfoSucceeded(blockInfo)) {
          throw new Error("Transaction did not succeed");
        }
      }

      await sleep(15_000);

      const productFee2 = await connection.getFeeQuote(registerUsernameTx);
      expect(productFee2.tokens).toEqual(fee2);

      connection.disconnect();
    }, 60_000);
  });
});
