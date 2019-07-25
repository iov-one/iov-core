import {
  Address,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import {
  ActionKind,
  bnsCodec,
  BnsConnection,
  ProposalExecutorResult,
  ProposalStatus,
  VoteOption,
} from "@iov/bns";
import { Encoding } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";
import { ReadonlyDate } from "readonly-date";

import { CommitteeId } from "../committees";
import { Governor, GovernorOptions } from "../governor";
import { ProposalOptions, ProposalType } from "../proposals";

// The first IOV key (m/44'/234'/0') generated from this mnemonic produces the address
// tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea (bech32) / a4f97447e7df55b6ef0d6209ebef2a7b22625376 (hex).
// This account has money in the genesis file (see scripts/bnsd/README.md).
const faucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
const faucetPath = HdPaths.iov(0);
const bnsdUrl = "ws://localhost:23456";
const guaranteeFundEscrowId = Encoding.fromHex("88008800");
const rewardFundAddress = "tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea" as Address;

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getGovernorOptions(
  path = faucetPath,
): Promise<GovernorOptions & { readonly profile: UserProfile; readonly address: Address }> {
  const connection = await BnsConnection.establish(bnsdUrl);
  const chainId = await connection.chainId();
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(faucetMnemonic));
  const identity = await profile.createIdentity(wallet.id, chainId, path);
  return {
    address: bnsCodec.identityToAddress(identity),
    connection: connection,
    identity: identity,
    guaranteeFundEscrowId: guaranteeFundEscrowId,
    rewardFundAddress: rewardFundAddress,
    profile: profile,
  };
}

async function signAndPost(
  tx: UnsignedTransaction & WithCreator,
  connection: BnsConnection,
  profile: UserProfile,
): Promise<void> {
  const nonce = await connection.getNonce({ pubkey: tx.creator.pubkey });
  const signed = await profile.signTransaction(tx, bnsCodec, nonce);
  const createProposalTxBytes = bnsCodec.bytesToPost(signed);
  const post = await connection.postTx(createProposalTxBytes);
  const blockInfo = await post.blockInfo.waitFor(info => !isBlockInfoPending(info));
  if (!isBlockInfoSucceeded(blockInfo)) {
    throw new Error("Transaction failed");
  }
}

describe("Proposals", () => {
  it("works for adding and removing committee members", async () => {
    pendingWithoutBnsd();
    const governorOptions = await getGovernorOptions();
    const { address, connection, profile } = governorOptions;
    const governor = new Governor(governorOptions);
    const numProposalsBefore = (await governor.getProposals()).length;

    const committeeId = 2 as CommitteeId;
    const electionRuleId = 2;
    const newCommitteeMember = "tiov12shyht3pvvacvyee36w5844jkfh5s0mf4gszp9" as Address;

    // Add committee member

    const startTime1 = new ReadonlyDate(Date.now() + 1_000);
    const proposal1Options: ProposalOptions = {
      type: ProposalType.AddCommitteeMember,
      title: "Add committee member",
      description: "Add a committee member in more detail",
      startTime: startTime1,
      electionRuleId: electionRuleId,
      committee: committeeId,
      address: newCommitteeMember,
      weight: 3,
    };
    const createProposal1Tx = await governor.buildCreateProposalTx(proposal1Options);
    await signAndPost(createProposal1Tx, connection, profile);

    const proposalsAfterCreate1 = await governor.getProposals();
    expect(proposalsAfterCreate1.length).toEqual(numProposalsBefore + 1);
    const proposal1Pre = proposalsAfterCreate1[proposalsAfterCreate1.length - 1];
    expect(proposal1Pre.title).toEqual("Add committee member");
    expect(proposal1Pre.description).toEqual("Add a committee member in more detail");
    expect(new ReadonlyDate(proposal1Pre.votingStartTime * 1000).toDateString()).toEqual(
      startTime1.toDateString(),
    );
    expect(proposal1Pre.electionRule.id).toEqual(electionRuleId);
    expect(proposal1Pre.author).toEqual(address);
    expect(proposal1Pre.action).toEqual({
      kind: ActionKind.UpdateElectorate,
      electorateId: committeeId,
      diffElectors: {
        [newCommitteeMember]: { weight: 3 },
      },
    });
    expect(proposal1Pre.status).toEqual(ProposalStatus.Submitted);

    await sleep(4000);

    const vote1Tx = await governor.buildVoteTx(proposal1Pre.id, VoteOption.Yes);
    await signAndPost(vote1Tx, connection, profile);

    await sleep(15000);

    const proposalsAfterVote1 = await governor.getProposals();
    expect(proposalsAfterVote1.length).toEqual(numProposalsBefore + 1);
    const proposal1Post = proposalsAfterVote1[proposalsAfterVote1.length - 1];
    expect(proposal1Post.id).toEqual(proposal1Pre.id);
    expect(proposal1Post.title).toEqual("Add committee member");
    expect(proposal1Post.status).toEqual(ProposalStatus.Closed);
    expect(proposal1Post.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    const electorates1 = (await governor.getElectorates()).filter(({ id }) => id === committeeId);
    const electorateWithAddedMember = electorates1[electorates1.length - 1];
    expect(electorateWithAddedMember.electors).toEqual({
      [address]: { weight: 10 },
      [newCommitteeMember]: { weight: 3 },
    });

    // Remove committee member

    const startTime2 = new ReadonlyDate(Date.now() + 1_000);
    const proposal2Options: ProposalOptions = {
      type: ProposalType.RemoveCommitteeMember,
      title: "Remove committee member",
      description: "Remove a committee member in more detail",
      startTime: startTime2,
      electionRuleId: electionRuleId,
      committee: committeeId,
      address: newCommitteeMember,
    };
    const createProposal2Tx = await governor.buildCreateProposalTx(proposal2Options);
    await signAndPost(createProposal2Tx, connection, profile);

    const proposalsAfterCreate2 = await governor.getProposals();
    expect(proposalsAfterCreate2.length).toEqual(numProposalsBefore + 2);
    const proposal2Pre = proposalsAfterCreate2[proposalsAfterCreate2.length - 1];
    expect(proposal2Pre.title).toEqual("Remove committee member");
    expect(proposal2Pre.description).toEqual("Remove a committee member in more detail");
    expect(new ReadonlyDate(proposal2Pre.votingStartTime * 1000).toDateString()).toEqual(
      startTime2.toDateString(),
    );
    expect(proposal2Pre.electionRule.id).toEqual(electionRuleId);
    expect(proposal2Pre.author).toEqual(address);
    expect(proposal2Pre.action).toEqual({
      kind: ActionKind.UpdateElectorate,
      electorateId: committeeId,
      diffElectors: {
        [newCommitteeMember]: { weight: 0 },
      },
    });
    expect(proposal2Pre.status).toEqual(ProposalStatus.Submitted);

    await sleep(4000);

    const vote2Tx = await governor.buildVoteTx(proposal2Pre.id, VoteOption.Yes);
    await signAndPost(vote2Tx, connection, profile);

    await sleep(15000);

    const proposalsAfterVote2 = await governor.getProposals();
    expect(proposalsAfterVote2.length).toEqual(numProposalsBefore + 2);
    const proposal2Post = proposalsAfterVote2[proposalsAfterVote2.length - 1];
    expect(proposal2Post.id).toEqual(proposal2Pre.id);
    expect(proposal2Post.title).toEqual("Remove committee member");
    expect(proposal2Post.status).toEqual(ProposalStatus.Closed);
    expect(proposal2Post.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    const electorates2 = (await governor.getElectorates()).filter(({ id }) => id === committeeId);
    const electorateWithRemovedMember = electorates2[electorates2.length - 1];
    expect(electorateWithRemovedMember.electors).toEqual({
      [address]: { weight: 10 },
    });

    connection.disconnect();
  }, 60_000);

  it("works for amending election rule threshold/quorum", async () => {
    pendingWithoutBnsd();
    const governorOptions = await getGovernorOptions();
    const { address, connection, profile } = governorOptions;
    const governor = new Governor(governorOptions);
    const numProposalsBefore = (await governor.getProposals()).length;

    const electionRuleId = 2;
    const electionRulePre = await governor.getElectionRuleById(electionRuleId);

    // Amend threshold

    const startTime1 = new ReadonlyDate(Date.now() + 1_000);
    const proposalOptions1: ProposalOptions = {
      type: ProposalType.AmendElectionRuleThreshold,
      title: "Amend election rule threshold",
      description: "Amend the election rule threshold in more detail",
      startTime: startTime1,
      electionRuleId: electionRuleId,
      targetElectionRuleId: electionRuleId,
      threshold: {
        numerator: 3,
        denominator: 4,
      },
    };
    const createProposal1Tx = await governor.buildCreateProposalTx(proposalOptions1);
    await signAndPost(createProposal1Tx, connection, profile);

    const proposalsAfterCreate1 = await governor.getProposals();
    expect(proposalsAfterCreate1.length).toEqual(numProposalsBefore + 1);
    const proposal1Pre = proposalsAfterCreate1[proposalsAfterCreate1.length - 1];
    expect(proposal1Pre.title).toEqual("Amend election rule threshold");
    expect(proposal1Pre.description).toEqual("Amend the election rule threshold in more detail");
    expect(new ReadonlyDate(proposal1Pre.votingStartTime * 1000).toDateString()).toEqual(
      startTime1.toDateString(),
    );
    expect(proposal1Pre.electionRule.id).toEqual(electionRuleId);
    expect(proposal1Pre.author).toEqual(address);
    expect(proposal1Pre.action).toEqual({
      kind: ActionKind.UpdateElectionRule,
      electionRuleId: electionRuleId,
      threshold: {
        numerator: 3,
        denominator: 4,
      },
      quorum: electionRulePre.quorum,
      votingPeriod: electionRulePre.votingPeriod,
    });
    expect(proposal1Pre.status).toEqual(ProposalStatus.Submitted);

    await sleep(6000);

    const vote1Tx = await governor.buildVoteTx(proposal1Pre.id, VoteOption.Yes);
    await signAndPost(vote1Tx, connection, profile);

    await sleep(15000);

    const proposalsAfterVote1 = await governor.getProposals();
    expect(proposalsAfterVote1.length).toEqual(numProposalsBefore + 1);
    const proposal1Post = proposalsAfterVote1[proposalsAfterVote1.length - 1];
    expect(proposal1Post.id).toEqual(proposal1Pre.id);
    expect(proposal1Post.title).toEqual("Amend election rule threshold");
    expect(proposal1Post.status).toEqual(ProposalStatus.Closed);
    expect(proposal1Post.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    const electionRule1 = await governor.getElectionRuleById(electionRuleId);
    expect(electionRule1.threshold).toEqual({
      numerator: 3,
      denominator: 4,
    });

    // Amend quorum

    const startTime2 = new ReadonlyDate(Date.now() + 1_000);
    const proposalOptions2: ProposalOptions = {
      type: ProposalType.AmendElectionRuleQuorum,
      title: "Amend election rule threshold",
      description: "Amend the election rule threshold in more detail",
      startTime: startTime2,
      electionRuleId: electionRuleId,
      targetElectionRuleId: electionRuleId,
      quorum: {
        numerator: 4,
        denominator: 7,
      },
    };
    const createProposal2Tx = await governor.buildCreateProposalTx(proposalOptions2);
    await signAndPost(createProposal2Tx, connection, profile);

    const proposalsAfterCreate2 = await governor.getProposals();
    expect(proposalsAfterCreate2.length).toEqual(numProposalsBefore + 2);
    const proposal2Pre = proposalsAfterCreate2[proposalsAfterCreate2.length - 1];
    expect(proposal2Pre.title).toEqual("Amend election rule threshold");
    expect(proposal2Pre.description).toEqual("Amend the election rule threshold in more detail");
    expect(new ReadonlyDate(proposal2Pre.votingStartTime * 1000).toDateString()).toEqual(
      startTime2.toDateString(),
    );
    expect(proposal2Pre.electionRule.id).toEqual(electionRuleId);
    expect(proposal2Pre.author).toEqual(address);
    expect(proposal2Pre.action).toEqual({
      kind: ActionKind.UpdateElectionRule,
      electionRuleId: electionRuleId,
      threshold: {
        numerator: 3,
        denominator: 4,
      },
      quorum: {
        numerator: 4,
        denominator: 7,
      },
      votingPeriod: electionRulePre.votingPeriod,
    });
    expect(proposal2Pre.status).toEqual(ProposalStatus.Submitted);

    await sleep(6000);

    const vote2Tx = await governor.buildVoteTx(proposal2Pre.id, VoteOption.Yes);
    await signAndPost(vote2Tx, connection, profile);

    await sleep(15000);

    const proposalsAfterVote2 = await governor.getProposals();
    expect(proposalsAfterVote2.length).toEqual(numProposalsBefore + 2);
    const proposal2Post = proposalsAfterVote2[proposalsAfterVote2.length - 1];
    expect(proposal2Post.id).toEqual(proposal2Pre.id);
    expect(proposal2Post.title).toEqual("Amend election rule threshold");
    expect(proposal2Post.status).toEqual(ProposalStatus.Closed);
    expect(proposal2Post.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    const electionRule2 = await governor.getElectionRuleById(electionRuleId);
    expect(electionRule2.quorum).toEqual({
      numerator: 4,
      denominator: 7,
    });

    connection.disconnect();
  }, 60_000);

  it("works for adding and removing validators", async () => {
    pendingWithoutBnsd();
    const governorOptions = await getGovernorOptions();
    const { address, connection, identity, profile } = governorOptions;
    const governor = new Governor(governorOptions);
    const numProposalsBefore = (await governor.getProposals()).length;
    const numValidatorsBefore = (await connection.getValidators()).length;
    const electionRuleId = 2;

    // Add validator

    const startTime1 = new ReadonlyDate(Date.now() + 1_000);
    const proposal1Options: ProposalOptions = {
      type: ProposalType.AddValidator,
      title: "Add validator",
      description: "Add a validator in more detail",
      startTime: startTime1,
      electionRuleId: electionRuleId,
      pubkey: identity.pubkey,
      power: 2,
    };
    const createProposal1Tx = await governor.buildCreateProposalTx(proposal1Options);
    await signAndPost(createProposal1Tx, connection, profile);

    const proposalsAfterCreate1 = await governor.getProposals();
    expect(proposalsAfterCreate1.length).toEqual(numProposalsBefore + 1);
    const proposal1Pre = proposalsAfterCreate1[proposalsAfterCreate1.length - 1];
    expect(proposal1Pre.title).toEqual("Add validator");
    expect(proposal1Pre.description).toEqual("Add a validator in more detail");
    expect(new ReadonlyDate(proposal1Pre.votingStartTime * 1000).toDateString()).toEqual(
      startTime1.toDateString(),
    );
    expect(proposal1Pre.electionRule.id).toEqual(electionRuleId);
    expect(proposal1Pre.author).toEqual(address);
    expect(proposal1Pre.action).toEqual({
      kind: ActionKind.SetValidators,
      validatorUpdates: {
        [`ed25519_${Encoding.toHex(identity.pubkey.data)}`]: { power: 2 },
      },
    });
    expect(proposal1Pre.status).toEqual(ProposalStatus.Submitted);

    await sleep(5000);

    const vote1Tx = await governor.buildVoteTx(proposal1Pre.id, VoteOption.Yes);
    await signAndPost(vote1Tx, connection, profile);

    await sleep(15000);

    const proposalsAfterVote1 = await governor.getProposals();
    expect(proposalsAfterVote1.length).toEqual(numProposalsBefore + 1);
    const proposal1Post = proposalsAfterVote1[proposalsAfterVote1.length - 1];
    expect(proposal1Post.id).toEqual(proposal1Pre.id);
    expect(proposal1Post.title).toEqual("Add validator");
    expect(proposal1Post.status).toEqual(ProposalStatus.Closed);
    expect(proposal1Post.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    const validatorsAfter1 = await connection.getValidators();
    expect(validatorsAfter1.length).toEqual(numValidatorsBefore + 1);
    const addedValidator = validatorsAfter1.find(
      validator => Encoding.toHex(validator.pubkey.data) === Encoding.toHex(identity.pubkey.data),
    );
    expect(addedValidator).toBeDefined();
    expect(addedValidator!.power).toEqual(2);

    // Remove validator

    const startTime2 = new ReadonlyDate(Date.now() + 1_000);
    const proposal2Options: ProposalOptions = {
      type: ProposalType.RemoveValidator,
      title: "Remove validator",
      description: "Remove a validator in more detail",
      startTime: startTime2,
      electionRuleId: electionRuleId,
      pubkey: identity.pubkey,
    };
    const createProposal2Tx = await governor.buildCreateProposalTx(proposal2Options);
    await signAndPost(createProposal2Tx, connection, profile);

    const proposalsAfterCreate2 = await governor.getProposals();
    expect(proposalsAfterCreate2.length).toEqual(numProposalsBefore + 2);
    const proposal2Pre = proposalsAfterCreate2[proposalsAfterCreate2.length - 1];
    expect(proposal2Pre.title).toEqual("Remove validator");
    expect(proposal2Pre.description).toEqual("Remove a validator in more detail");
    expect(new ReadonlyDate(proposal2Pre.votingStartTime * 1000).toDateString()).toEqual(
      startTime2.toDateString(),
    );
    expect(proposal2Pre.electionRule.id).toEqual(electionRuleId);
    expect(proposal2Pre.author).toEqual(address);
    expect(proposal2Pre.action).toEqual({
      kind: ActionKind.SetValidators,
      validatorUpdates: {
        [`ed25519_${Encoding.toHex(identity.pubkey.data)}`]: { power: 0 },
      },
    });
    expect(proposal2Pre.status).toEqual(ProposalStatus.Submitted);

    await sleep(5000);

    const vote2Tx = await governor.buildVoteTx(proposal2Pre.id, VoteOption.Yes);
    await signAndPost(vote2Tx, connection, profile);

    await sleep(15000);

    const proposalsAfterVote2 = await governor.getProposals();
    expect(proposalsAfterVote2.length).toEqual(numProposalsBefore + 2);
    const proposal2Post = proposalsAfterVote2[proposalsAfterVote2.length - 1];
    expect(proposal2Post.id).toEqual(proposal2Pre.id);
    expect(proposal2Post.title).toEqual("Remove validator");
    expect(proposal2Post.status).toEqual(ProposalStatus.Closed);
    expect(proposal2Post.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    const validatorsAfter2 = await connection.getValidators();
    expect(validatorsAfter2.length).toEqual(numValidatorsBefore);
    const removedValidator = validatorsAfter2.find(
      validator => Encoding.toHex(validator.pubkey.data) === Encoding.toHex(identity.pubkey.data),
    );
    expect(removedValidator).not.toBeDefined();

    connection.disconnect();
  }, 60_000);

  it("works for releasing and distributing guarantee funds");

  it("works for amending the protocol", async () => {
    pendingWithoutBnsd();
    const governorOptions = await getGovernorOptions();
    const { address, connection, profile } = governorOptions;
    const governor = new Governor(governorOptions);
    const numProposalsBefore = (await governor.getProposals()).length;

    const electionRuleId = 2;
    const startTime = new ReadonlyDate(Date.now() + 1_000);
    const proposalOptions: ProposalOptions = {
      type: ProposalType.AmendProtocol,
      title: "Amend protocol",
      description: "Amend the protocol in more detail",
      startTime: startTime,
      electionRuleId: electionRuleId,
      text: "Give IOV devs master keys to all accounts",
    };
    const createProposalTx = await governor.buildCreateProposalTx(proposalOptions);
    await signAndPost(createProposalTx, connection, profile);

    const proposalsAfterCreate = await governor.getProposals();
    expect(proposalsAfterCreate.length).toEqual(numProposalsBefore + 1);
    const proposal1 = proposalsAfterCreate[proposalsAfterCreate.length - 1];
    expect(proposal1.title).toEqual("Amend protocol");
    expect(proposal1.description).toEqual("Amend the protocol in more detail");
    expect(new ReadonlyDate(proposal1.votingStartTime * 1000).toDateString()).toEqual(
      startTime.toDateString(),
    );
    expect(proposal1.electionRule.id).toEqual(electionRuleId);
    expect(proposal1.author).toEqual(address);
    expect(proposal1.action).toEqual({
      kind: ActionKind.CreateTextResolution,
      resolution: "Give IOV devs master keys to all accounts",
    });
    expect(proposal1.status).toEqual(ProposalStatus.Submitted);

    await sleep(4000);

    const voteTx = await governor.buildVoteTx(proposal1.id, VoteOption.Yes);
    await signAndPost(voteTx, connection, profile);

    await sleep(15000);

    const proposalsAfterVote = await governor.getProposals();
    expect(proposalsAfterVote.length).toEqual(numProposalsBefore + 1);
    const proposal2 = proposalsAfterVote[proposalsAfterVote.length - 1];
    expect(proposal2.id).toEqual(proposal1.id);
    expect(proposal2.title).toEqual("Amend protocol");
    expect(proposal2.status).toEqual(ProposalStatus.Closed);
    expect(proposal2.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    connection.disconnect();
  }, 60_000);
});
