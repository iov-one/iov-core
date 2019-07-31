import { Address, Identity, WithCreator } from "@iov/bcp";
import {
  BnsConnection,
  CreateProposalTx,
  ElectionRule,
  Electorate,
  Proposal,
  VoteOption,
  VoteTx,
} from "@iov/bns";
import { ProposalOptions } from "./proposals";
export interface GovernorOptions {
  readonly connection: BnsConnection;
  readonly identity: Identity;
  readonly guaranteeFundEscrowId?: Uint8Array;
  readonly rewardFundAddress?: Address;
}
export declare class Governor {
  private readonly connection;
  private readonly identity;
  private readonly address;
  private readonly guaranteeFundEscrowId?;
  private readonly rewardFundAddress?;
  constructor({ connection, identity, guaranteeFundEscrowId, rewardFundAddress }: GovernorOptions);
  getElectorates(): Promise<readonly Electorate[]>;
  getElectionRules(electorateId: number): Promise<readonly ElectionRule[]>;
  getElectionRuleById(electionRuleId: number): Promise<ElectionRule>;
  getProposals(): Promise<readonly Proposal[]>;
  buildCreateProposalTx(options: ProposalOptions): Promise<CreateProposalTx & WithCreator>;
  buildVoteTx(proposalId: number, selection: VoteOption): Promise<VoteTx & WithCreator>;
}
