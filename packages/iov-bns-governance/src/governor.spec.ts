import { ReadonlyDate } from "readonly-date";

import { Address, Identity, TokenTicker } from "@iov/bcp";
import { bnsCodec, BnsConnection, VoteOption } from "@iov/bns";
import { Ed25519HdWallet, HdPaths, UserProfile } from "@iov/keycontrol";

import { CommitteeId } from "./committees";
import { Governor } from "./governor";
import { ProposalType } from "./proposals";

function pendingWithoutBnsd(): void {
  if (!process.env.BNSD_ENABLED) {
    pending("Set BNSD_ENABLED to enable bnsd-based tests");
  }
}

// The first IOV key (m/44'/234'/0') generated from this mnemonic produces the address
// tiov15nuhg3l8ma2mdmcdvgy7hme20v3xy5mkxcezea (bech32) / a4f97447e7df55b6ef0d6209ebef2a7b22625376 (hex).
// This account has money in the genesis file (see scripts/bnsd/README.md).
const faucetMnemonic = "degree tackle suggest window test behind mesh extra cover prepare oak script";
const faucetPath = HdPaths.iov(0);
const bnsdUrl = "http://localhost:23456";

async function getConnectionAndIdentity(
  path = faucetPath,
): Promise<{ readonly connection: BnsConnection; readonly identity: Identity }> {
  const connection = await BnsConnection.establish(bnsdUrl);
  const chainId = await connection.chainId();
  const profile = new UserProfile();
  const wallet = profile.addWallet(Ed25519HdWallet.fromMnemonic(faucetMnemonic));
  const identity = await profile.createIdentity(wallet.id, chainId, path);
  return {
    connection: connection,
    identity: identity,
  };
}

describe("Governor", () => {
  it("can be constructed", async () => {
    pendingWithoutBnsd();
    const options = await getConnectionAndIdentity();
    const governor = new Governor(options);
    expect(governor).toBeTruthy();

    options.connection.disconnect();
  });

  describe("getElectorates", () => {
    it("can get electorates", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      const electorates = await governor.getElectorates();
      expect(electorates.length).toEqual(2);
      expect(electorates[0].id).toEqual(1);
      expect(electorates[1].id).toEqual(2);

      options.connection.disconnect();
    });

    it("can get empty list of electorates", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity(HdPaths.iov(100));
      const governor = new Governor(options);

      const electorates = await governor.getElectorates();
      expect(electorates.length).toEqual(0);

      options.connection.disconnect();
    });
  });

  describe("getElectionRules", () => {
    it("throws for non-existent electorateId", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      const electorateId = 100;
      await governor
        .getElectionRules(electorateId)
        .then(
          () => fail("Expected promise to be rejected"),
          err => expect(err.message).toMatch(/no election rule found/i),
        );

      options.connection.disconnect();
    });

    it("returns the latest versions of election rules for an electorate", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      const electorateId = 1;
      const electionRules = await governor.getElectionRules(electorateId);
      expect(electionRules.length).toEqual(1);
      expect(electionRules[0].id).toEqual(1);
      expect(electionRules[0].version).toEqual(1);

      options.connection.disconnect();
    });
  });

  describe("getProposals", () => {
    it("can get an empty list of proposals", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity(HdPaths.iov(100));
      const governor = new Governor(options);

      const proposals = await governor.getProposals();
      expect(proposals.length).toEqual(0);

      options.connection.disconnect();
    });
  });

  describe("buildCreateProposalTx", () => {
    it("throws an error for unsupported proposal types", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      await governor
        .buildCreateProposalTx({
          type: ProposalType.AddCommitteeMember,
          description: "Change something",
          startTime: new ReadonlyDate(1562164525898),
          electionRuleId: 5,
          committee: 8 as CommitteeId,
          address: "abcd" as Address,
        })
        .then(
          () => fail("Expected promise to be rejected"),
          err => expect(err.message).toMatch(/proposal type not yet supported/i),
        );

      options.connection.disconnect();
    });

    it("can create a CreateProposal transaction for AmendProtocol", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.AmendProtocol,
        text: "Switch to Proof-of-Work",
        description: "Proposal to change consensus algorithm to POW",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
      });
      expect(tx).toEqual({
        kind: "bns/create_proposal",
        creator: options.identity,
        title: "Amend protocol",
        action: {
          resolution: "Switch to Proof-of-Work",
        },
        description: "Proposal to change consensus algorithm to POW",
        electionRuleId: 1,
        startTime: 1562164525,
        author: bnsCodec.identityToAddress(options.identity),
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
        },
      });

      options.connection.disconnect();
    });

    it("can create a CreateProposal transaction with a custom title", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      const tx = await governor.buildCreateProposalTx({
        type: ProposalType.AmendProtocol,
        text: "Switch to Proof-of-Work",
        title: "Custom title",
        description: "Proposal to change consensus algorithm to POW",
        startTime: new ReadonlyDate(1562164525898),
        electionRuleId: 1,
      });
      expect(tx.title).toEqual("Custom title");

      options.connection.disconnect();
    });
  });

  describe("buildVoteTx", () => {
    it("can create a Vote transaction", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      const tx = await governor.buildVoteTx(5, VoteOption.Yes);
      expect(tx).toEqual({
        kind: "bns/vote",
        creator: options.identity,
        proposalId: 5,
        selection: VoteOption.Yes,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
        },
      });

      options.connection.disconnect();
    });
  });

  describe("buildTallyTx", () => {
    it("can create a Tally transaction", async () => {
      pendingWithoutBnsd();
      const options = await getConnectionAndIdentity();
      const governor = new Governor(options);

      const tx = await governor.buildTallyTx(5);
      expect(tx).toEqual({
        kind: "bns/tally",
        creator: options.identity,
        proposalId: 5,
        fee: {
          tokens: {
            quantity: "10000000",
            fractionalDigits: 9,
            tokenTicker: "CASH" as TokenTicker,
          },
        },
      });

      options.connection.disconnect();
    });
  });
});
