import { Address, Amount, PubkeyBundle } from "@iov/bcp";
import { Fraction } from "@iov/bns";
import { ReadonlyDate } from "readonly-date";
import { As } from "type-tagger";

export type CommitteeId = number & As<"committee">;

export enum ProposalType {
  AddCommitteeMember,
  RemoveCommitteeMember,
  AmendElectionRuleThreshold,
  AmendElectionRuleQuorum,
  AddValidator,
  RemoveValidator,
  ReleaseGuaranteeFunds,
  DistributeFunds,
  AmendProtocol,
  ExecuteMigration,
}

interface CommonProposalOptions {
  readonly type: ProposalType;
  readonly title: string;
  readonly description: string;
  readonly startTime: ReadonlyDate;
  readonly electionRuleId: number;
}

export interface AddCommitteeMemberOptions extends CommonProposalOptions {
  readonly type: ProposalType.AddCommitteeMember;
  readonly committee: CommitteeId;
  readonly address: Address;
  readonly weight: number;
}

export interface RemoveCommitteeMemberOptions extends CommonProposalOptions {
  readonly type: ProposalType.RemoveCommitteeMember;
  readonly committee: CommitteeId;
  readonly address: Address;
}

export interface AmendElectionRuleThresholdOptions extends CommonProposalOptions {
  readonly type: ProposalType.AmendElectionRuleThreshold;
  readonly targetElectionRuleId: number;
  readonly threshold: Fraction;
}

export interface AmendElectionRuleQuorumOptions extends CommonProposalOptions {
  readonly type: ProposalType.AmendElectionRuleQuorum;
  readonly targetElectionRuleId: number;
  readonly quorum: Fraction | null;
}

export interface AddValidatorOptions extends CommonProposalOptions {
  readonly type: ProposalType.AddValidator;
  readonly pubkey: PubkeyBundle;
  readonly power: number;
}

export interface RemoveValidatorOptions extends CommonProposalOptions {
  readonly type: ProposalType.RemoveValidator;
  readonly pubkey: PubkeyBundle;
}

export interface ReleaseGuaranteeFundsOptions extends CommonProposalOptions {
  readonly type: ProposalType.ReleaseGuaranteeFunds;
  readonly amount: Amount;
}

export interface DistributeFundsOptions extends CommonProposalOptions {
  readonly type: ProposalType.DistributeFunds;
  readonly recipients: readonly {
    readonly address: Address;
    readonly weight: number;
  }[];
}

export interface AmendProtocolOptions extends CommonProposalOptions {
  readonly type: ProposalType.AmendProtocol;
  readonly text: string;
}

export interface ExecuteMigrationOptions extends CommonProposalOptions {
  readonly type: ProposalType.ExecuteMigration;
  readonly id: string;
}

export type ProposalOptions =
  | AddCommitteeMemberOptions
  | RemoveCommitteeMemberOptions
  | AmendElectionRuleThresholdOptions
  | AmendElectionRuleQuorumOptions
  | AddValidatorOptions
  | RemoveValidatorOptions
  | ReleaseGuaranteeFundsOptions
  | DistributeFundsOptions
  | AmendProtocolOptions
  | ExecuteMigrationOptions;
