import {
  Address,
  isBlockInfoPending,
  isBlockInfoSucceeded,
  UnsignedTransaction,
  WithCreator,
} from "@iov/bcp";
import { ActionKind, bnsCodec, BnsConnection, ProposalStatus, VoteOption } from "@iov/bns";
import { Encoding } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";
import { ReadonlyDate } from "readonly-date";

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
): Promise<GovernorOptions & { readonly profile: UserProfile }> {
  const connection = await BnsConnection.establish(bnsdUrl);
  const chainId = await connection.chainId();
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(faucetMnemonic));
  const identity = await profile.createIdentity(wallet.id, chainId, path);
  return {
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
  it("works for adding and removing committee members");

  it("works for amending election rule threshold/quorum");

  it("works for adding and removing validators");

  it("works for releasing and distributing guarantee funds");

  it("works for amending the protocol", async () => {
    pendingWithoutBnsd();
    const governorOptions = await getGovernorOptions();
    const { connection, identity, profile } = governorOptions;
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
    expect(proposal1.author).toEqual(bnsCodec.identityToAddress(identity));
    expect(proposal1.action).toEqual({
      kind: ActionKind.CreateTextResolution,
      resolution: "Give IOV devs master keys to all accounts",
    });
    expect(proposal1.status).toEqual(ProposalStatus.Submitted);

    await sleep(4000);

    const voteTx = await governor.buildVoteTx(proposal1.id, VoteOption.Yes);
    await signAndPost(voteTx, connection, profile);

    await sleep(5000);

    const proposalsAfterVote = await governor.getProposals();
    expect(proposalsAfterVote.length).toEqual(numProposalsBefore + 1);
    const proposal2 = proposalsAfterVote[proposalsAfterVote.length - 1];
    expect(proposal2.id).toEqual(proposal1.id);
    expect(proposal2.title).toEqual("Amend protocol");
    expect(proposal2.status).toEqual(ProposalStatus.Closed);
    expect(proposal2.executorResult).toEqual(ProposalExecutorResult.Succeeded);

    connection.disconnect();
  });
});
