import { ReadonlyDate } from "readonly-date";
import { Address, Amount } from "@iov/bcp";
import { Fraction } from "@iov/bns";
import { CommitteeId } from "./committees";
export declare enum ProposalType {
    AddCommitteeMember = 0,
    RemoveCommitteeMember = 1,
    AmendCommitteeThreshold = 2,
    AmendCommitteeQuorum = 3,
    AddValidator = 4,
    RemoveValidator = 5,
    AccessGuaranteeFund = 6,
    DistributeFunds = 7,
    AmendProtocol = 8
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
    readonly address: Address;
}
export interface RemoveValidatorOptions extends CommonProposalOptions {
    readonly type: ProposalType.RemoveValidator;
    readonly address: Address;
}
export interface AccessGuaranteeFundOptions extends CommonProposalOptions {
    readonly type: ProposalType.AccessGuaranteeFund;
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
export declare type ProposalOptions = AddCommitteeMemberOptions | RemoveCommitteeMemberOptions | AmendCommitteeThresholdOptions | AmendCommitteeQuorumOptions | AddValidatorOptions | RemoveValidatorOptions | AccessGuaranteeFundOptions | DistributeFundsOptions | AmendProtocolOptions;
export {};
