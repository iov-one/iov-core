import {
  Address,
  BlockInfo,
  ChainId,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  isConfirmedAndSignedTransaction,
  isSendTransaction,
  SendTransaction,
  TokenTicker,
  TransactionState,
  UnsignedTransaction,
} from "@iov/bcp";
import { Random } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";
import { assert, sleep } from "@iov/utils";
import BN from "bn.js";

import { bnsCodec } from "./bnscodec";
import { BnsConnection } from "./bnsconnection";
import { decodeNumericId } from "./decodinghelpers";
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
  tendermintSearchIndexUpdated,
  unusedAddress,
  userProfileWithFaucet,
} from "./testutils.spec";
import {
  ActionKind,
  ChainAddressPair,
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

describe("BnsConnection (post txs)", () => {
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
      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: chainId,
          sender: bnsCodec.identityToAddress(faucet),
          recipient: recipient,
          memo: "My first payment",
          amount: {
            quantity: "5000075000",
            fractionalDigits: 9,
            tokenTicker: cash,
          },
        },
        faucetAddr,
      );
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
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
      const search = (await connection.searchTx({ sentFromOrTo: faucetAddr })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(search.length).toBeGreaterThanOrEqual(1);
      // make sure we get a valid signature
      const mine = search[search.length - 1];
      // make sure we have a txid
      expect(mine.height).toBeGreaterThan(initialHeight);
      expect(mine.transactionId).toMatch(/^[0-9A-F]{64}$/);
      const tx = mine.transaction;
      assert(isSendTransaction(tx), "Expected SendTransaction");
      expect(tx).toEqual(sendTx);

      connection.disconnect();
    });

    // TODO: extend this with missing and high fees
    it("rejects send transaction with manual fees too low", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, faucet } = await userProfileWithFaucet(chainId);
      const faucetAddress = bnsCodec.identityToAddress(faucet);

      const sendTx: SendTransaction = {
        kind: "bcp/send",
        chainId: chainId,
        sender: faucetAddress,
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
          payer: faucetAddress,
        },
      };
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
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
      const faucetAddress = bnsCodec.identityToAddress(faucet);

      // memo too long will trigger failure in CheckTx (validation of message)
      const sendTx = await connection.withDefaultFee<SendTransaction>(
        {
          kind: "bcp/send",
          chainId: chainId,
          sender: faucetAddress,
          recipient: await randomBnsAddress(),
          amount: {
            ...defaultAmount,
            tokenTicker: "UNKNOWN" as TokenTicker,
          },
        },
        faucetAddress,
      );
      const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);

      await connection.postTx(bnsCodec.bytesToPost(signed)).then(
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
        const faucetAddress = bnsCodec.identityToAddress(faucet);
        const recipient = await randomBnsAddress();

        // construct a sendtx, this is normally used in the MultiChainSigner api
        const sendTx = await connection.withDefaultFee<SendTransaction>(
          {
            kind: "bcp/send",
            chainId: chainId,
            sender: faucetAddress,
            recipient: recipient,
            memo: "My first payment",
            amount: {
              quantity: "5000075000",
              fractionalDigits: 9,
              tokenTicker: cash,
            },
          },
          faucetAddress,
        );
        const nonce = await connection.getNonce({ pubkey: faucet.pubkey });
        const signed = await profile.signTransaction(faucet, sendTx, bnsCodec, nonce);
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
      const registration = await connection.withDefaultFee<RegisterUsernameTx>(
        {
          kind: "bns/register_username",
          chainId: registryChainId,
          username: username,
          targets: [{ chainId: "foobar" as ChainId, address: address }],
        },
        address,
      );
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(identity, registration, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = (await connection.searchTx({ signedBy: address })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult.length).toEqual(1);
      const firstSearchResultTransaction = searchResult[0].transaction;
      assert(isRegisterUsernameTx(firstSearchResultTransaction), "Expected RegisterUsernameTx");
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
      const registration = await connection.withDefaultFee<RegisterUsernameTx>(
        {
          kind: "bns/register_username",
          chainId: registryChainId,
          username: username,
          targets: [],
        },
        address,
      );
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(identity, registration, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find registration transaction
      const searchResult = (await connection.searchTx({ signedBy: address })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult.length).toEqual(1);
      const firstSearchResultTransaction = searchResult[0].transaction;
      assert(isRegisterUsernameTx(firstSearchResultTransaction), "Expected RegisterUsernameTx");
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
      const usernameRegistration = await connection.withDefaultFee<RegisterUsernameTx>(
        {
          kind: "bns/register_username",
          chainId: registryChainId,
          username: username,
          targets: targets1,
        },
        myAddress,
      );
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              identity,
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
      const updateTargets = await connection.withDefaultFee<UpdateTargetsOfUsernameTx>(
        {
          kind: "bns/update_targets_of_username",
          chainId: registryChainId,
          username: username,
          targets: targets2,
        },
        myAddress,
      );
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              identity,
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
      const clearAddresses = await connection.withDefaultFee<UpdateTargetsOfUsernameTx>(
        {
          kind: "bns/update_targets_of_username",
          chainId: registryChainId,
          username: username,
          targets: [],
        },
        myAddress,
      );
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              identity,
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
      const usernameRegistration = await connection.withDefaultFee<RegisterUsernameTx>(
        {
          kind: "bns/register_username",
          chainId: registryChainId,
          username: username,
          targets: targets1,
        },
        myAddress,
      );
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              identity,
              usernameRegistration,
              bnsCodec,
              await connection.getNonce({ pubkey: identity.pubkey }),
            ),
          ),
        );
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        expect(blockInfo.state).toEqual(TransactionState.Succeeded);
      }

      const transferUsername = await connection.withDefaultFee<TransferUsernameTx>(
        {
          kind: "bns/transfer_username",
          chainId: registryChainId,
          username: username,
          newOwner: unusedAddress,
        },
        myAddress,
      );
      {
        const response = await connection.postTx(
          bnsCodec.bytesToPost(
            await profile.signTransaction(
              identity,
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

    it("can register and update a username for an empty account", async () => {
      pendingWithoutBnsd();
      const connection = await BnsConnection.establish(bnsdTendermintUrl);
      const chainId = connection.chainId();

      const { profile, faucet, walletId } = await userProfileWithFaucet(chainId);
      const faucetAddress = identityToAddress(faucet);
      const brokeAccountPath = HdPaths.iov(666);
      const user = await profile.createIdentity(walletId, chainId, brokeAccountPath);
      const userAddress = identityToAddress(user);
      const username = `user${Math.random()}*iov`;

      const userAccount = await connection.getAccount({ address: userAddress });
      if (userAccount && userAccount.balance.length) {
        throw new Error("Test should be run using empty account");
      }

      const initialTargets: readonly ChainAddressPair[] = [
        {
          chainId: "some-initial-chain" as ChainId,
          address: "some-initial-address" as Address,
        },
      ];
      const registerUsernameTx = await connection.withDefaultFee<RegisterUsernameTx>(
        {
          kind: "bns/register_username",
          chainId: chainId,
          username: username,
          targets: initialTargets,
        },
        faucetAddress,
      );
      const nonceUser1 = await connection.getNonce({ pubkey: user.pubkey });
      const signed1 = await profile.signTransaction(user, registerUsernameTx, bnsCodec, nonceUser1);
      const nonceFaucet1 = await connection.getNonce({ pubkey: faucet.pubkey });
      const doubleSigned1 = await profile.appendSignature(faucet, signed1, bnsCodec, nonceFaucet1);
      const txBytes1 = bnsCodec.bytesToPost(doubleSigned1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      const retrieved1 = await connection.getUsernames({ username: username });
      expect(retrieved1.length).toEqual(1);
      expect(retrieved1[0].owner).toEqual(userAddress);
      expect(retrieved1[0].targets).toEqual(initialTargets);

      const updatedTargets: readonly ChainAddressPair[] = [
        {
          chainId: "some-updated-chain" as ChainId,
          address: "some-updated-address" as Address,
        },
      ];
      const updateTargetsTx = await connection.withDefaultFee<UpdateTargetsOfUsernameTx>(
        {
          kind: "bns/update_targets_of_username",
          chainId: chainId,
          username: username,
          targets: updatedTargets,
        },
        faucetAddress,
      );
      const nonce3 = await connection.getNonce({ pubkey: faucet.pubkey });
      const signed3 = await profile.signTransaction(faucet, updateTargetsTx, bnsCodec, nonce3);
      const nonce4 = await connection.getNonce({ pubkey: user.pubkey });
      const doubleSigned2 = await profile.appendSignature(user, signed3, bnsCodec, nonce4);
      const txBytes3 = bnsCodec.bytesToPost(doubleSigned2);
      const response3 = await connection.postTx(txBytes3);
      const blockInfo3 = await response3.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo3.state).toEqual(TransactionState.Succeeded);

      const retrieved2 = await connection.getUsernames({ username: username });
      expect(retrieved2.length).toEqual(1);
      expect(retrieved2[0].owner).toEqual(userAddress);
      expect(retrieved2[0].targets).toEqual(updatedTargets);

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
      const tx1 = await connection.withDefaultFee<CreateMultisignatureTx>(
        {
          kind: "bns/create_multisignature_contract",
          chainId: registryChainId,
          participants: participants,
          activationThreshold: 4,
          adminThreshold: 5,
        },
        address,
      );
      const nonce1 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed1 = await profile.signTransaction(identity, tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: address })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result: contractId, transaction: firstSearchResultTransaction } = searchResult1[0];
      assert(isCreateMultisignatureTx(firstSearchResultTransaction), "Expected CreateMultisignatureTx");
      expect(firstSearchResultTransaction.participants.length).toEqual(6);
      firstSearchResultTransaction.participants.forEach((participant, i) => {
        expect(participant.address).toEqual(participants[i].address);
        expect(participant.weight).toEqual(participants[i].weight);
      });
      expect(firstSearchResultTransaction.activationThreshold).toEqual(4);
      expect(firstSearchResultTransaction.adminThreshold).toEqual(5);
      expect(contractId).toBeDefined();

      // Update multisignature
      const participantsUpdated: readonly Participant[] = (
        await Promise.all(
          [15, 16, 17].map(i => profile.createIdentity(wallet.id, registryChainId, HdPaths.iov(i))),
        )
      ).map(id => ({
        address: identityToAddress(id),
        weight: 6,
      }));
      const tx2 = await connection.withDefaultFee<UpdateMultisignatureTx>(
        {
          kind: "bns/update_multisignature_contract",
          chainId: registryChainId,
          contractId: contractId!,
          participants: participantsUpdated,
          activationThreshold: 2,
          adminThreshold: 6,
        },
        address,
      );
      const nonce2 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed2 = await profile.signTransaction(identity, tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction2
      const searchResult2 = (await connection.searchTx({ signedBy: address })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult2.length).toEqual(2);
      const { transaction: secondSearchResultTransaction } = searchResult2[1];
      assert(isUpdateMultisignatureTx(secondSearchResultTransaction), "Expected UpdateMultisignatureTx");
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
      const tx1 = await connection.withDefaultFee<CreateEscrowTx>(
        {
          kind: "bns/create_escrow",
          chainId: registryChainId,
          sender: senderAddress,
          arbiter: arbiterAddress,
          recipient: recipientAddress,
          amounts: [defaultAmount],
          timeout: timeout,
          memo: memo,
        },
        senderAddress,
      );
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(sender, tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      assert(isCreateEscrowTx(firstSearchResultTransaction), "Expected CreateEscrowTx");
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Release escrow
      const tx2 = await connection.withDefaultFee<ReleaseEscrowTx>(
        {
          kind: "bns/release_escrow",
          chainId: registryChainId,
          escrowId: escrowId,
          amounts: [defaultAmount],
        },
        arbiterAddress,
      );
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(arbiter, tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      assert(isReleaseEscrowTx(secondSearchResultTransaction), "Expected ReleaseEscrowTx");
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

        const createEscrowTx = await connection.withDefaultFee<CreateEscrowTx>(
          {
            kind: "bns/create_escrow",
            chainId: chainId,
            sender: senderAddress,
            arbiter: encodeBnsAddress("tiov", fromHex("0000000000000000000000000000000000000000")),
            recipient: encodeBnsAddress("tiov", fromHex("0000000000000000000000000000000000000000")),
            amounts: [defaultAmount],
            timeout: { timestamp: timeout },
          },
          senderAddress,
        );

        const nonce = await connection.getNonce({ pubkey: sender.pubkey });
        const signed = await profile.signTransaction(sender, createEscrowTx, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        assert(isBlockInfoSucceeded(blockInfo), `Expected success but got state: ${blockInfo.state}`);
        escrowId = blockInfo.result || fromHex("");
      }

      await sleep(5_000);

      {
        // Use an external helper account (random path from random wallet) that returns the escrow for source
        const addressIndex = getRandomInteger(100, 2 ** 31);
        const helperIdentity = await profile.createIdentity(wallet.id, chainId, HdPaths.iov(addressIndex));
        const helperAddress = identityToAddress(helperIdentity);
        await sendTokensFromFaucet(connection, helperAddress);

        const returnEscrowTx = await connection.withDefaultFee<ReturnEscrowTx>(
          {
            kind: "bns/return_escrow",
            chainId: chainId,
            escrowId: decodeNumericId(escrowId),
          },
          helperAddress,
        );

        const nonce = await connection.getNonce({ pubkey: helperIdentity.pubkey });
        const signed = await profile.signTransaction(helperIdentity, returnEscrowTx, bnsCodec, nonce);
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
      const tx1 = await connection.withDefaultFee<CreateEscrowTx>(
        {
          kind: "bns/create_escrow",
          chainId: registryChainId,
          sender: senderAddress,
          arbiter: arbiterAddress,
          recipient: recipientAddress,
          amounts: [defaultAmount],
          timeout: timeout,
          memo: memo,
        },
        senderAddress,
      );
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(sender, tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      assert(isCreateEscrowTx(firstSearchResultTransaction), "Expected CreateEscrowTx");
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
      const tx2 = await connection.withDefaultFee<ReturnEscrowTx>(
        {
          kind: "bns/return_escrow",
          chainId: registryChainId,
          escrowId: escrowId,
        },
        arbiterAddress,
      );
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(arbiter, tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      assert(isReturnEscrowTx(secondSearchResultTransaction), "Expected ReturnEscrowTx");
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
      const tx1 = await connection.withDefaultFee<CreateEscrowTx>(
        {
          kind: "bns/create_escrow",
          chainId: registryChainId,
          sender: senderAddress,
          arbiter: arbiterAddress,
          recipient: recipientAddress,
          amounts: [defaultAmount],
          timeout: timeout,
          memo: memo,
        },
        senderAddress,
      );
      const nonce1 = await connection.getNonce({ pubkey: sender.pubkey });
      const signed1 = await profile.signTransaction(sender, tx1, bnsCodec, nonce1);
      const txBytes1 = bnsCodec.bytesToPost(signed1);
      const response1 = await connection.postTx(txBytes1);
      const blockInfo1 = await response1.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo1.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult1 = (await connection.searchTx({ signedBy: senderAddress })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult1.length).toEqual(1);
      const { result, transaction: firstSearchResultTransaction } = searchResult1[0];
      assert(isCreateEscrowTx(firstSearchResultTransaction), "Expected CreateEscrowTx");
      expect(firstSearchResultTransaction.sender).toEqual(senderAddress);
      expect(firstSearchResultTransaction.recipient).toEqual(recipientAddress);
      expect(firstSearchResultTransaction.arbiter).toEqual(arbiterAddress);
      expect(firstSearchResultTransaction.amounts).toEqual([defaultAmount]);
      expect(firstSearchResultTransaction.timeout).toEqual(timeout);
      expect(firstSearchResultTransaction.memo).toEqual(memo);
      expect(result).toBeDefined();

      const escrowId = decodeNumericId(result!);

      // Update escrow
      const tx2 = await connection.withDefaultFee<UpdateEscrowPartiesTx>(
        {
          kind: "bns/update_escrow_parties",
          chainId: registryChainId,
          escrowId: escrowId,
          arbiter: newArbiterAddress,
        },
        arbiterAddress,
      );
      const nonce2 = await connection.getNonce({ pubkey: arbiter.pubkey });
      const signed2 = await profile.signTransaction(arbiter, tx2, bnsCodec, nonce2);
      const txBytes2 = bnsCodec.bytesToPost(signed2);
      const response2 = await connection.postTx(txBytes2);
      const blockInfo2 = await response2.blockInfo.waitFor(info => !isBlockInfoPending(info));
      expect(blockInfo2.state).toEqual(TransactionState.Succeeded);

      await tendermintSearchIndexUpdated();

      // Find transaction1
      const searchResult2 = (await connection.searchTx({ signedBy: arbiterAddress })).filter(
        isConfirmedAndSignedTransaction,
      );
      expect(searchResult2.length).toEqual(1);
      const { transaction: secondSearchResultTransaction } = searchResult2[0];
      assert(isUpdateEscrowPartiesTx(secondSearchResultTransaction), "Expected UpdateEscrowPartiesTx");
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
        const createProposal = await connection.withDefaultFee<CreateProposalTx>(
          {
            kind: "bns/create_proposal",
            chainId: chainId,
            title: title,
            description: description,
            author: authorAddress,
            electionRuleId: someElectionRule.id,
            action: action,
            startTime: startTime,
          },
          authorAddress,
        );
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(author, createProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        assert(isBlockInfoSucceeded(blockInfo), `Expected success but got state: ${blockInfo.state}`);
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
        const voteForProposal = await connection.withDefaultFee<VoteTx>(
          {
            kind: "bns/vote",
            chainId: chainId,
            proposalId: proposalId,
            selection: VoteOption.Yes,
            voter: authorAddress,
          },
          authorAddress,
        );
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(author, voteForProposal, bnsCodec, nonce);
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
        const createProposal = await connection.withDefaultFee<CreateProposalTx>(
          {
            kind: "bns/create_proposal",
            chainId: chainId,
            title: title,
            description: description,
            author: authorAddress,
            electionRuleId: someElectionRule.id,
            action: action,
            startTime: startTime,
          },
          authorAddress,
        );
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(author, createProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        assert(isBlockInfoSucceeded(blockInfo), `Expected success but got state: ${blockInfo.state}`);
        if (!blockInfo.result) {
          throw new Error("Transaction result missing");
        }
        proposalId1 = new BN(blockInfo.result).toNumber();
      }

      await sleep(6_000);

      {
        const voteForProposal = await connection.withDefaultFee<VoteTx>(
          {
            kind: "bns/vote",
            chainId: chainId,
            proposalId: proposalId1,
            selection: VoteOption.Yes,
            voter: authorAddress,
          },
          authorAddress,
        );
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(author, voteForProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        assert(isBlockInfoSucceeded(blockInfo), `Expected success but got state: ${blockInfo.state}`);
      }

      await sleep(15_000);

      const registerUsernameTx: RegisterUsernameTx & UnsignedTransaction = {
        kind: "bns/register_username",
        chainId: chainId,
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
        const createProposal = await connection.withDefaultFee<CreateProposalTx>(
          {
            kind: "bns/create_proposal",
            chainId: chainId,
            title: title,
            description: description,
            author: authorAddress,
            electionRuleId: someElectionRule.id,
            action: action,
            startTime: startTime,
          },
          authorAddress,
        );
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(author, createProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        assert(isBlockInfoSucceeded(blockInfo), `Expected success but got state: ${blockInfo.state}`);
        if (!blockInfo.result) {
          throw new Error("Transaction result missing");
        }
        proposalId2 = new BN(blockInfo.result).toNumber();
      }

      await sleep(6_000);

      {
        const voteForProposal = await connection.withDefaultFee<VoteTx>(
          {
            kind: "bns/vote",
            chainId: chainId,
            proposalId: proposalId2,
            selection: VoteOption.Yes,
            voter: authorAddress,
          },
          authorAddress,
        );
        const nonce = await connection.getNonce({ pubkey: author.pubkey });
        const signed = await profile.signTransaction(author, voteForProposal, bnsCodec, nonce);
        const response = await connection.postTx(bnsCodec.bytesToPost(signed));
        const blockInfo = await response.blockInfo.waitFor(info => !isBlockInfoPending(info));
        assert(isBlockInfoSucceeded(blockInfo), `Expected success but got state: ${blockInfo.state}`);
      }

      await sleep(15_000);

      const productFee2 = await connection.getFeeQuote(registerUsernameTx);
      expect(productFee2.tokens).toEqual(fee2);

      connection.disconnect();
    }, 60_000);
  });
});
