import { Address, Amount, PubkeyBundle } from "@iov/bcp";
import { Fraction } from "@iov/bns";
import { ReadonlyDate } from "readonly-date";

import { CommitteeId } from "./committees";

export enum ProposalType {
  AddCommitteeMember,
  RemoveCommitteeMember,
  AmendCommitteeThreshold,
  AmendCommitteeQuorum,
  AddValidator,
  RemoveValidator,
  ReleaseGuaranteeFunds,
  DistributeFunds,
  AmendProtocol,
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

export interface AmendCommitteeThresholdOptions extends CommonProposalOptions {
  readonly type: ProposalType.AmendCommitteeThreshold;
  readonly committee: CommitteeId;
  readonly threshold: Fraction;
}

export interface AmendCommitteeQuorumOptions extends CommonProposalOptions {
  readonly type: ProposalType.AmendCommitteeQuorum;
  readonly committee: CommitteeId;
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

export type ProposalOptions =
  | AddCommitteeMemberOptions
  | RemoveCommitteeMemberOptions
  | AmendCommitteeThresholdOptions
  | AmendCommitteeQuorumOptions
  | AddValidatorOptions
  | RemoveValidatorOptions
  | ReleaseGuaranteeFundsOptions
  | DistributeFundsOptions
  | AmendProtocolOptions;
