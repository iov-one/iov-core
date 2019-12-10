import { Address, Identity, WithChainId } from "@iov/bcp";
import {
  BnsConnection,
  CreateProposalTx,
  ElectionRule,
  Electorate,
  Proposal,
  Vote,
  VoteOption,
  VoteTx,
} from "@iov/bns";
import { ProposalOptions } from "./proposals";
export interface GovernorOptions {
  readonly connection: BnsConnection;
  readonly identity: Identity;
  readonly guaranteeFundEscrowId?: number;
  readonly rewardFundAddress?: Address;
}
export declare class Governor {
  readonly address: Address;
  private readonly connection;
  private readonly identity;
  private readonly guaranteeFundEscrowId?;
  private readonly rewardFundAddress?;
  constructor({ connection, identity, guaranteeFundEscrowId, rewardFundAddress }: GovernorOptions);
  /**
   * Returns a list of electorates that contain the current governor as one of the electors
   *
   * @param skipFiltering if set to true, the list is not filtered by electors anymore
   */
  getElectorates(skipFiltering?: boolean): Promise<readonly Electorate[]>;
  getElectionRules(electorateId: number): Promise<readonly ElectionRule[]>;
  getElectionRuleById(electionRuleId: number): Promise<ElectionRule>;
  getProposals(): Promise<readonly Proposal[]>;
  getVotes(): Promise<readonly Vote[]>;
  buildCreateProposalTx(options: ProposalOptions): Promise<CreateProposalTx & WithChainId>;
  buildVoteTx(proposalId: number, selection: VoteOption): Promise<VoteTx & WithChainId>;
}
