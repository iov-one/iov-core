import BN = require("bn.js");

import { Address, Identity, WithCreator } from "@iov/bcp";
import {
  ActionKind,
  bnsCodec,
  BnsConnection,
  CreateProposalTx,
  ElectionRule,
  Electorate,
  Proposal,
  TallyTx,
  VoteOption,
  VoteTx,
} from "@iov/bns";

import { ProposalOptions, ProposalType } from "./proposals";
import { groupByCallback, maxWithComparatorCallback } from "./utils";

export interface GovernorOptions {
  readonly connection: BnsConnection;
  readonly identity: Identity;
}

export class Governor {
  private readonly connection: BnsConnection;
  private readonly identity: Identity;
  private readonly address: Address;

  public constructor({ connection, identity }: GovernorOptions) {
    this.connection = connection;
    this.identity = identity;
    this.address = bnsCodec.identityToAddress(this.identity);
  }

  public async getElectorates(): Promise<readonly Electorate[]> {
    const electorates = await this.connection.getElectorates();
    return electorates.filter(({ electors }) => Object.keys(electors).some(key => key === this.address));
  }

  public async getElectionRules(electorateId: number): Promise<readonly ElectionRule[]> {
    const electionRules = await this.connection.getElectionRules();
    const filteredRules = electionRules.filter(rule => rule.electorateId === electorateId);

    if (filteredRules.length === 0) {
      throw new Error("No election rule found for electorate");
    }

    const groupedRules = groupByCallback(filteredRules, rule => rule.id);
    return groupedRules.map(group =>
      maxWithComparatorCallback(group.values, (rule1, rule2) => rule1.version - rule2.version),
    );
  }

  public async getProposals(): Promise<readonly Proposal[]> {
    const electorates = await this.getElectorates();
    const proposals = await this.connection.getProposals();
    return proposals.filter(({ electorate }) => {
      const electorateId = new BN(electorate.id).toNumber();
      return electorates.some(({ id }) => id === electorateId);
    });
  }

  public async buildCreateProposalTx(options: ProposalOptions): Promise<CreateProposalTx & WithCreator> {
    const commonProperties = {
      kind: "bns/create_proposal" as const,
      creator: this.identity,
      author: this.address,
      title: options.title,
      description: options.description,
      startTime: Math.floor(options.startTime.valueOf() / 1000),
      electionRuleId: options.electionRuleId,
    };
    switch (options.type) {
      case ProposalType.AddCommitteeMember:
        return this.connection.withDefaultFee<CreateProposalTx & WithCreator>({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectorate,
            electorateId: options.committee,
            diffElectors: {
              [options.address]: { weight: options.weight },
            },
          },
        });
      case ProposalType.RemoveCommitteeMember:
        return this.connection.withDefaultFee<CreateProposalTx & WithCreator>({
          ...commonProperties,
          action: {
            kind: ActionKind.UpdateElectorate,
            electorateId: options.committee,
            diffElectors: {
              [options.address]: { weight: 0 },
            },
          },
        });
      case ProposalType.AmendProtocol:
        return this.connection.withDefaultFee<CreateProposalTx & WithCreator>({
          ...commonProperties,
          action: {
            kind: ActionKind.CreateTextResolution,
            resolution: options.text,
          },
        });
      default:
        throw new Error("Proposal type not yet supported");
    }
  }

  public async buildVoteTx(proposalId: number, selection: VoteOption): Promise<VoteTx & WithCreator> {
    return this.connection.withDefaultFee<VoteTx & WithCreator>({
      kind: "bns/vote",
      creator: this.identity,
      proposalId: proposalId,
      selection: selection,
    });
  }

  public async buildTallyTx(proposalId: number): Promise<TallyTx & WithCreator> {
    return this.connection.withDefaultFee<TallyTx & WithCreator>({
      kind: "bns/tally",
      creator: this.identity,
      proposalId: proposalId,
    });
  }
}
