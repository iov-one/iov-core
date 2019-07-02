import { As } from "type-tagger";

import { Address, Amount, ChainId, PostTxResponse } from "@iov/bcp";
import { BnsConnection, Electorate, Fraction, Proposal, VoteOption } from "@iov/bns";
import { UserProfile } from "@iov/keycontrol";

type CommitteeId = number & As<"committee">;

/* Constants to be finalised once the committees are actually on-chain */
export const COMMITTEE_IDS = {
  ["testnet" as ChainId]: {
    GOVERNING_BOARD: 1 as CommitteeId,
    ECONOMIC_COMMITTEE: 2 as CommitteeId,
    VALIDATOR_COMMITTEE: 3 as CommitteeId,
    TECH_COMMITTEE: 4 as CommitteeId,
  },
};

export enum ProposalType {
  ADD_COMMITTEE_MEMBER,
  REMOVE_COMMITTEE_MEMBER,
  AMEND_COMMITTEE_THRESHOLD,
  AMEND_COMMITTEE_QUORUM,
  ADD_VALIDATOR,
  REMOVE_VALIDATOR,
  ACCESS_GUARANTEE_FUND,
  DISTRIBUTE_FUNDS,
  AMEND_PROTOCOL,
}

export interface AddCommitteeMemberOptions {
  readonly type: ProposalType.ADD_COMMITTEE_MEMBER;
  readonly committee: CommitteeId;
  readonly address: Address;
}

export interface RemoveCommitteeMemberOptions {
  readonly type: ProposalType.REMOVE_COMMITTEE_MEMBER;
  readonly committee: CommitteeId;
  readonly address: Address;
}

export interface AmendCommitteeThresholdOptions {
  readonly type: ProposalType.AMEND_COMMITTEE_THRESHOLD;
  readonly committee: CommitteeId;
  readonly threshold: Fraction;
}

export interface AmendCommitteeQuorumOptions {
  readonly type: ProposalType.AMEND_COMMITTEE_QUORUM;
  readonly committee: CommitteeId;
  readonly quorum: Fraction | null;
}

export interface AddValidatorOptions {
  readonly type: ProposalType.ADD_VALIDATOR;
  readonly address: Address;
}

export interface RemoveValidatorOptions {
  readonly type: ProposalType.REMOVE_VALIDATOR;
  readonly address: Address;
}

export interface AccessGuaranteeFundOptions {
  readonly type: ProposalType.ACCESS_GUARANTEE_FUND;
  readonly amount: Amount;
}

export interface DistributeFundsOptions {
  readonly type: ProposalType.DISTRIBUTE_FUNDS;
  readonly recipients: readonly {
    readonly address: Address;
    readonly weight: number;
  }[];
}

export interface AmendProtocolOptions {
  readonly type: ProposalType.AMEND_PROTOCOL;
  readonly text: string;
}

export type ProposalOptions =
  | AddCommitteeMemberOptions
  | RemoveCommitteeMemberOptions
  | AmendCommitteeThresholdOptions
  | AmendCommitteeQuorumOptions
  | AddValidatorOptions
  | RemoveValidatorOptions
  | AccessGuaranteeFundOptions
  | DistributeFundsOptions
  | AmendProtocolOptions;

export interface GovernorOptions {
  readonly connection: BnsConnection;
  readonly profile: UserProfile;
}

export class Governor {
  private readonly connection: BnsConnection;
  private readonly profile: UserProfile;

  public constructor({ connection, profile }: GovernorOptions) {
    this.connection = connection;
    this.profile = profile;
  }

  /* Wraps BnsConnection.getElectorates, filtering for electorates this profile has membership of */
  public async getElectorates(): Promise<readonly Electorate[]>;

  /* Wraps BnsConnection.getProposals, filtering for proposals this profile can vote on */
  public async getProposals(): Promise<readonly Proposal[]>;

  /* 1. Constructs a CreateProposalTx using the options and a default fee
   * 2. Signs the transaction using the profile
   * 3. Posts the transaction using the connection
   * 4. Resolves to the PostTxResponse
   *
   * Currently we only support creating text resolutions, so this would just format the relevant information
   * into a standardised string for each proposal type.
   */
  public async submitProposal(options: ProposalOptions): Promise<PostTxResponse>;

  /* 1. Constructs a VoteTx using the options and a default fee
   * 2. Signs the transaction using the profile
   * 3. Posts the transaction using the connection
   * 4. Resolves to the PostTxResponse
   */
  public async voteOnProposal(proposalId: string, voteOption: VoteOption): Promise<PostTxResponse>;

  /* 1. Constructs a TallyTx using the options and a default fee
   * 2. Signs the transaction using the profile
   * 3. Posts the transaction using the connection
   * 4. Resolves to the PostTxResponse
   */
  public async tallyVotes(proposalId: string): Promise<PostTxResponse>;
}
