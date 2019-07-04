import BN = require("bn.js");

import { Address, Identity, WithCreator } from "@iov/bcp";
import {
  bnsCodec,
  BnsConnection,
  BnsTx,
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

  public async createProposalTx(options: ProposalOptions): Promise<BnsTx & WithCreator> {
    switch (options.type) {
      case ProposalType.AmendProtocol:
        return this.connection.withDefaultFee<CreateProposalTx & WithCreator>({
          kind: "bns/create_proposal",
          creator: this.identity,
          title: options.title || "Amend protocol",
          action: {
            resolution: options.text,
          },
          description: options.description,
          electionRuleId: options.electionRuleId,
          startTime: Math.floor(options.startTime.valueOf() / 1000),
          author: this.address,
        });
      default:
        throw new Error("Proposal type not yet supported");
    }
  }

  public async createVoteTx(proposalId: number, selection: VoteOption): Promise<BnsTx & WithCreator> {
    return this.connection.withDefaultFee<VoteTx & WithCreator>({
      kind: "bns/vote",
      creator: this.identity,
      proposalId: proposalId,
      selection: selection,
    });
  }

  public async createTallyTx(proposalId: number): Promise<BnsTx & WithCreator> {
    return this.connection.withDefaultFee<TallyTx & WithCreator>({
      kind: "bns/tally",
      creator: this.identity,
      proposalId: proposalId,
    });
  }
}
