/* eslint-disable @typescript-eslint/camelcase */
import { Address, Algorithm, isBlockInfoPending, PubkeyBundle, PubkeyBytes, TokenTicker } from "@iov/bcp";
import { ActionKind, bnsCodec, BnsConnection, VoteOption } from "@iov/bns";
import { Random } from "@iov/crypto";
import { Bech32, toHex } from "@iov/encoding";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";
import { sleep } from "@iov/utils";
import { ReadonlyDate } from "readonly-date";

import { Governor, GovernorOptions } from "./governor";
import { CommitteeId, ProposalType } from "./proposals";

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

function randomBnsAddress(): Address {
  return Bech32.encode("tiov", Random.getBytes(20)) as Address;
}

function randomBnsPubkey(): PubkeyBundle {
  return {
    algo: Algorithm.Ed25519,
    data: Random.getBytes(32) as PubkeyBytes,
  };
}

// Dev admin
// path: m/44'/234'/0'
// pubkey: 418f88ff4876d33a3d6e2a17d0fe0e78dc3cb5e4b42c6c156ed1b8bfce5d46d1
// IOV address: tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea
// This account has money in the genesis file (see scripts/bnsd/README.md).
const adminMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
const adminPath = HdPaths.iov(0);
const bnsdUrl = "ws://localhost:23456";
const guaranteeFundEscrowId = 6;
const rewardFundAddress = "tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea" as Address;

async function getGovernorOptions(
  path = adminPath,
): Promise<GovernorOptions & { readonly profile: UserProfile }> {
  const connection = await BnsConnection.establish(bnsdUrl);
  const chainId = connection.chainId;
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(adminMnemonic));
  const identity = await profile.createIdentity(wallet.id, chainId, path);
  return {
    connection: connection,
    identity: identity,
    guaranteeFundEscrowId: guaranteeFundEscrowId,
    rewardFundAddress: rewardFundAddress,
    profile: profile,
  };
}

describe("Governor", () => {
  it("can be constructed", async () => {
    pendingWithoutBnsd();
    const options = await getGovernorOptions();
    const governor = new Governor(options);
    expect(governor).toBeTruthy();

    options.connection.disconnect();
  });

  describe("address", () => {
    it("returns correct address", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);
      expect(governor.address).toEqual("tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea");

      options.connection.disconnect();
    });
  });

  describe("getElectorates", () => {
    it("can get electorates", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const electorates = await governor.getElectorates();
      expect(electorates.length).toEqual(2);
      expect(electorates[0].id).toEqual(1);
      expect(electorates[1].id).toEqual(2);

      options.connection.disconnect();
    });

    it("only lists electorates that contain the governor by default", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const electorates = await governor.getElectorates();
      expect(electorates.length).toBeGreaterThanOrEqual(1);
      for (const electorate of electorates) {
        const electorAddresses = Object.keys(electorate.electors);
        expect(electorAddresses).toContain(governor.address);
      }

      options.connection.disconnect();
    });

    it("can get empty list of electorates", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions(HdPaths.iov(100));
      const governor = new Governor(options);

      const electorates = await governor.getElectorates();
      expect(electorates.length).toEqual(0);

      options.connection.disconnect();
    });

    it("can get all electorates when filtering is skipped", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const electorates = await governor.getElectorates(true);
      expect(electorates.length).toBeGreaterThanOrEqual(3);
      expect(electorates[0].id).toEqual(1);
      expect(electorates[1].id).toEqual(2);
      expect(electorates[2].id).toEqual(3);

      options.connection.disconnect();
    });

    it("lists each ID only once", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const electorates = await governor.getElectorates(true);

      const uniqueIds = new Set(electorates.map((electorate) => electorate.id));
      expect(uniqueIds.size).toEqual(electorates.length);

      options.connection.disconnect();
    });
  });

  describe("getElectionRules", () => {
    it("returns an empty array for non-existent electorateId", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const electorateId = 100;
      const electionRules = await governor.getElectionRules(electorateId);
      expect(electionRules.length).toEqual(0);

      options.connection.disconnect();
    });

    it("returns the latest versions of election rules for an electorate", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const electorateId = 1;
      const electionRules = (await governor.getElectionRules(electorateId)).filter(
        ({ version }) => version === 1,
      );
      expect(electionRules.length).toEqual(1);
      expect(electionRules[0].id).toEqual(1);
      expect(electionRules[0].version).toEqual(1);

      options.connection.disconnect();
    });
  });

  describe("getProposals", () => {
    it("can get an empty list of proposals", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions(HdPaths.iov(100));
      const governor = new Governor(options);

      const proposals = await governor.getProposals();
      expect(proposals.length).toEqual(0);

      options.connection.disconnect();
    });
  });

  describe("buildCreateProposalTx", () => {
    it("works for AmendProtocol", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.AmendProtocol,
        title: "Switch to Proof-of-Work",
        description: "Proposal to change consensus algorithm to POW",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        text: "Switch to Proof-of-Work",
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: "Switch to Proof-of-Work",
        action: {
          kind: ActionKind.CreateTextResolution,
          resolution: "Switch to Proof-of-Work",
        },
        description: "Proposal to change consensus algorithm to POW",
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });

    it("works for AddCommitteeMember", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const address = randomBnsAddress();
      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.AddCommitteeMember,
        title: `Add ${address} to committee 5`,
        description: `Proposal to add ${address} to committee 5`,
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        committee: 5 as CommitteeId,
        address: address,
        weight: 4,
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: `Add ${address} to committee 5`,
        action: {
          kind: ActionKind.UpdateElectorate,
          electorateId: 5,
          diffElectors: {
            [address]: { weight: 4 },
          },
        },
        description: `Proposal to add ${address} to committee 5`,
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });

    it("works for RemoveCommitteeMember", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const address = randomBnsAddress();
      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.RemoveCommitteeMember,
        title: `Remove ${address} from committee 5`,
        description: `Proposal to remove ${address} from committee 5`,
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        committee: 5 as CommitteeId,
        address: address,
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: `Remove ${address} from committee 5`,
        action: {
          kind: ActionKind.UpdateElectorate,
          electorateId: 5,
          diffElectors: {
            [address]: { weight: 0 },
          },
        },
        description: `Proposal to remove ${address} from committee 5`,
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });

    it("works for AmendElectionRuleThreshold", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.AmendElectionRuleThreshold,
        title: "Amend threshold for committee 5",
        description: "Proposal to amend threshold to 2/7",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        targetElectionRuleId: 2,
        threshold: {
          numerator: 2,
          denominator: 7,
        },
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: "Amend threshold for committee 5",
        action: {
          kind: ActionKind.UpdateElectionRule,
          electionRuleId: 2,
          threshold: {
            numerator: 2,
            denominator: 7,
          },
          quorum: {
            numerator: 2,
            denominator: 3,
          },
          votingPeriod: 10,
        },
        description: "Proposal to amend threshold to 2/7",
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });

    it("works for AmendElectionRuleQuorum", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.AmendElectionRuleQuorum,
        title: "Amend quorum for committee 5",
        description: "Proposal to amend quorum to 2/7",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        targetElectionRuleId: 2,
        quorum: {
          numerator: 2,
          denominator: 7,
        },
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: "Amend quorum for committee 5",
        action: {
          kind: ActionKind.UpdateElectionRule,
          electionRuleId: 2,
          threshold: {
            numerator: 1,
            denominator: 2,
          },
          quorum: {
            numerator: 2,
            denominator: 7,
          },
          votingPeriod: 10,
        },
        description: "Proposal to amend quorum to 2/7",
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });

    it("works for AddValidator", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const pubkey = randomBnsPubkey();
      const pubkeyHex = toHex(pubkey.data);
      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.AddValidator,
        title: `Add ${pubkeyHex} as validator`,
        description: `Proposal to add ${pubkeyHex} as validator`,
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        pubkey: pubkey,
        power: 12,
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: `Add ${pubkeyHex} as validator`,
        action: {
          kind: ActionKind.SetValidators,
          validatorUpdates: {
            [`ed25519_${pubkeyHex}`]: { power: 12 },
          },
        },
        description: `Proposal to add ${pubkeyHex} as validator`,
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });

    it("works for RemoveValidator", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const pubkey = randomBnsPubkey();
      const pubkeyHex = toHex(pubkey.data);
      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.RemoveValidator,
        title: `Remove validator ${pubkeyHex}`,
        description: `Proposal to remove validator ${pubkeyHex}`,
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        pubkey: pubkey,
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: `Remove validator ${pubkeyHex}`,
        action: {
          kind: ActionKind.SetValidators,
          validatorUpdates: {
            [`ed25519_${pubkeyHex}`]: { power: 0 },
          },
        },
        description: `Proposal to remove validator ${pubkeyHex}`,
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });

    it("works for ReleaseGuaranteeFunds", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.ReleaseGuaranteeFunds,
        title: "Release guarantee funds",
        description: "Proposal to release guarantee funds",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        amount: {
          quantity: "2000000002",
          fractionalDigits: 9,
          tokenTicker: "CASH" as TokenTicker,
        },
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: options.identity.chainId,
        title: "Release guarantee funds",
        action: {
          kind: ActionKind.ReleaseEscrow,
          escrowId: guaranteeFundEscrowId,
          amount: {
            quantity: "2000000002",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
        },
        description: "Proposal to release guarantee funds",
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });
      options.connection.disconnect();
    });

    it("works for DistributeFunds", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const { connection, identity, profile } = options;
      const address = connection.codec.identityToAddress(identity);
      const cleanRewardFundAddress = Bech32.encode("tiov", Random.getBytes(20)) as Address;
      const governor = new Governor({
        ...options,
        rewardFundAddress: cleanRewardFundAddress,
      });

      const sendTx = await connection.withDefaultFee(
        {
          kind: "bcp/send",
          chainId: identity.chainId,
          sender: address,
          recipient: cleanRewardFundAddress,
          amount: {
            quantity: "999000000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
        },
        address,
      );
      const nonce = await connection.getNonce({ pubkey: identity.pubkey });
      const signed = await profile.signTransaction(identity, sendTx, bnsCodec, nonce);
      const response = await connection.postTx(bnsCodec.bytesToPost(signed));
      await response.blockInfo.waitFor((info) => !isBlockInfoPending(info));

      const recipient1 = randomBnsAddress();
      const recipient2 = randomBnsAddress();
      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.DistributeFunds,
        title: "Distribute funds",
        description: "Proposal to distribute funds",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        recipients: [
          {
            address: recipient1,
            weight: 2,
          },
          {
            address: recipient2,
            weight: 5,
          },
        ],
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: identity.chainId,
        title: "Distribute funds",
        action: {
          kind: ActionKind.ExecuteProposalBatch,
          messages: [
            {
              kind: ActionKind.Send,
              sender: cleanRewardFundAddress,
              recipient: recipient1,
              amount: {
                quantity: "285428571428",
                fractionalDigits: 9,
                tokenTicker: "CASH" as TokenTicker,
              },
            },
            {
              kind: ActionKind.Send,
              sender: cleanRewardFundAddress,
              recipient: recipient2,
              amount: {
                quantity: "713571428571",
                fractionalDigits: 9,
                tokenTicker: "CASH" as TokenTicker,
              },
            },
          ],
        },
        description: "Proposal to distribute funds",
        electionRuleId: 1,
        startTime: 1562164525,
        author: address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: address,
        },
      });

      connection.disconnect();
    });

    it("works for ExecuteMigration", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const { connection, identity } = options;
      const governor = new Governor({ ...options });

      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.ExecuteMigration,
        title: "Execute this migration",
        description: "for some good reason",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
        id: "foobar",
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        chainId: identity.chainId,
        title: "Execute this migration",
        description: "for some good reason",
        action: {
          kind: ActionKind.ExecuteMigration,
          id: "foobar",
        },
        electionRuleId: 1,
        startTime: 1562164525,
        author: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      connection.disconnect();
    });
  });

  describe("createVoteTx", () => {
    it("can build a Vote transaction", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);

      const tx = await governor.buildVoteTx(5, VoteOption.Yes);
      expect(tx).toEqual({
        kind: "bns/vote",
        chainId: options.identity.chainId,
        proposalId: 5,
        selection: VoteOption.Yes,
        voter: governor.address,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
          payer: governor.address,
        },
      });

      options.connection.disconnect();
    });
  });

  describe("getVotes", () => {
    it("can get all votes cast by a governor", async () => {
      pendingWithoutBnsd();
      const options = await getGovernorOptions();
      const governor = new Governor(options);
      const { connection, identity, profile } = options;

      const createProposalTx = await governor.buildCreateProposalTx({
        type: ProposalType.AmendProtocol,
        title: "Test getVote",
        description: "Proposal to test getVote",
        startTime: new ReadonlyDate(Date.now() + 1000),
        electionRuleId: 1,
        text: "Get a vote",
      });

      const nonce1 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed1 = await profile.signTransaction(identity, createProposalTx, bnsCodec, nonce1);
      const response1 = await connection.postTx(bnsCodec.bytesToPost(signed1));
      await response1.blockInfo.waitFor((info) => !isBlockInfoPending(info));

      await sleep(7000);

      const votesPre = await governor.getVotes();

      const proposals = await governor.getProposals();
      const proposalId = proposals[proposals.length - 1].id;
      const voteTx = await governor.buildVoteTx(proposalId, VoteOption.Yes);
      const nonce2 = await connection.getNonce({ pubkey: identity.pubkey });
      const signed2 = await profile.signTransaction(identity, voteTx, bnsCodec, nonce2);
      const response2 = await connection.postTx(bnsCodec.bytesToPost(signed2));
      await response2.blockInfo.waitFor((info) => !isBlockInfoPending(info));

      const votesPost = await governor.getVotes();
      expect(votesPost.length).toEqual(votesPre.length + 1);
      expect(votesPost[votesPost.length - 1].proposalId).toEqual(proposalId);
      expect(votesPost[votesPost.length - 1].selection).toEqual(VoteOption.Yes);

      connection.disconnect();
    });
  });
});
