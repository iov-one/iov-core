import { As } from "type-tagger";
import { Address, Algorithm, Amount, ChainId, LightTransaction, SendTransaction, SwapAbortTransaction, SwapClaimTransaction, SwapOfferTransaction, TimestampTimeout } from "@iov/bcp";
export interface CashConfiguration {
    readonly minimalFee: Amount;
}
export interface Elector {
    readonly address: Address;
    /** The voting weight of this elector. Max value is 65535 (2^16-1). */
    readonly weight: number;
}
export interface Electorate {
    readonly id: number;
    readonly version: number;
    readonly admin: Address;
    readonly title: string;
    /** An unordered map from address to elector */
    readonly electors: {
        readonly [index: string]: Elector;
    };
    /** Sum of all electors' weights */
    readonly totalWeight: number;
}
export interface Fraction {
    readonly numerator: number;
    readonly denominator: number;
}
export interface ElectionRule {
    readonly version: number;
    readonly admin: Address;
    /** The electorate used by this (ID without version, as changing electorate changes the rule) */
    readonly electorateId: number;
    readonly title: string;
    /** Voting period in seconds */
    readonly votingPeriod: number;
    readonly threshold: Fraction;
    readonly quorum: Fraction | null;
}
export interface VersionedId {
    readonly id: Uint8Array;
    readonly version: number;
}
export declare enum ProposalExecutorResult {
    NotRun = 0,
    Succeeded = 1,
    Failed = 2
}
export declare enum ProposalResult {
    Undefined = 0,
    Accepted = 1,
    Rejected = 2
}
export declare enum ProposalStatus {
    Submitted = 0,
    Closed = 1,
    Withdrawn = 2
}
export interface Proposal {
    readonly title: string;
    /** The transaction to be executed when the proposal is accepted */
    readonly rawOption: Uint8Array;
    readonly description: string;
    readonly electionRule: VersionedId;
    readonly electorate: VersionedId;
    /** Time when the voting on this proposal starts (Unix timestamp) */
    readonly votingStartTime: number;
    /** Time when the voting on this proposal starts (Unix timestamp) */
    readonly votingEndTime: number;
    /** Time of the block where the proposal was added to the chain (Unix timestamp) */
    readonly submissionTime: number;
    /** The author of the proposal must be included in the list of transaction signers. */
    readonly author: Address;
    readonly status: ProposalStatus;
    readonly result: ProposalResult;
    readonly executorResult: ProposalExecutorResult;
}
export interface ChainAddressPair {
    readonly chainId: ChainId;
    readonly address: Address;
}
export interface BnsUsernameNft {
    readonly id: string;
    readonly owner: Address;
    readonly addresses: readonly ChainAddressPair[];
}
export interface BnsUsernamesByUsernameQuery {
    readonly username: string;
}
export interface BnsUsernamesByOwnerQuery {
    readonly owner: Address;
}
export declare type BnsUsernamesQuery = BnsUsernamesByUsernameQuery | BnsUsernamesByOwnerQuery;
export declare function isBnsUsernamesByUsernameQuery(query: BnsUsernamesQuery): query is BnsUsernamesByUsernameQuery;
export declare function isBnsUsernamesByOwnerQuery(query: BnsUsernamesQuery): query is BnsUsernamesByOwnerQuery;
export declare type PrivkeyBytes = Uint8Array & As<"privkey-bytes">;
export interface PrivkeyBundle {
    readonly algo: Algorithm;
    readonly data: PrivkeyBytes;
}
export interface Result {
    readonly key: Uint8Array;
    readonly value: Uint8Array;
}
export interface Keyed {
    readonly _id: Uint8Array;
}
export interface Decoder<T extends {}> {
    readonly decode: (data: Uint8Array) => T;
}
export interface RegisterUsernameTx extends LightTransaction {
    readonly kind: "bns/register_username";
    readonly username: string;
    readonly addresses: readonly ChainAddressPair[];
}
export declare function isRegisterUsernameTx(tx: LightTransaction): tx is RegisterUsernameTx;
export interface AddAddressToUsernameTx extends LightTransaction {
    readonly kind: "bns/add_address_to_username";
    /** the username to be updated, must exist on chain */
    readonly username: string;
    readonly payload: ChainAddressPair;
}
export declare function isAddAddressToUsernameTx(tx: LightTransaction): tx is AddAddressToUsernameTx;
export interface RemoveAddressFromUsernameTx extends LightTransaction {
    readonly kind: "bns/remove_address_from_username";
    /** the username to be updated, must exist on chain */
    readonly username: string;
    readonly payload: ChainAddressPair;
}
export declare function isRemoveAddressFromUsernameTx(tx: LightTransaction): tx is RemoveAddressFromUsernameTx;
export interface Participant {
    readonly address: Address;
    readonly weight: number;
}
export interface CreateMultisignatureTx extends LightTransaction {
    readonly kind: "bns/create_multisignature_contract";
    readonly participants: readonly Participant[];
    readonly activationThreshold: number;
    readonly adminThreshold: number;
}
export declare function isCreateMultisignatureTx(tx: LightTransaction): tx is CreateMultisignatureTx;
export interface UpdateMultisignatureTx extends LightTransaction {
    readonly kind: "bns/update_multisignature_contract";
    readonly contractId: Uint8Array;
    readonly participants: readonly Participant[];
    readonly activationThreshold: number;
    readonly adminThreshold: number;
}
export declare function isUpdateMultisignatureTx(tx: LightTransaction): tx is UpdateMultisignatureTx;
export interface CreateEscrowTx extends LightTransaction {
    readonly kind: "bns/create_escrow";
    readonly sender: Address;
    readonly arbiter: Address;
    readonly recipient: Address;
    readonly amounts: readonly Amount[];
    readonly timeout: TimestampTimeout;
    readonly memo?: string;
}
export declare function isCreateEscrowTx(tx: LightTransaction): tx is CreateEscrowTx;
export interface ReleaseEscrowTx extends LightTransaction {
    readonly kind: "bns/release_escrow";
    readonly escrowId: Uint8Array;
    readonly amounts: readonly Amount[];
}
export declare function isReleaseEscrowTx(tx: LightTransaction): tx is ReleaseEscrowTx;
export interface ReturnEscrowTx extends LightTransaction {
    readonly kind: "bns/return_escrow";
    readonly escrowId: Uint8Array;
}
export declare function isReturnEscrowTx(tx: LightTransaction): tx is ReturnEscrowTx;
export interface UpdateEscrowPartiesTx extends LightTransaction {
    readonly kind: "bns/update_escrow_parties";
    readonly escrowId: Uint8Array;
    readonly sender?: Address;
    readonly arbiter?: Address;
    readonly recipient?: Address;
}
export declare function isUpdateEscrowPartiesTx(tx: LightTransaction): tx is UpdateEscrowPartiesTx;
export interface CreateProposalTx extends LightTransaction {
    readonly kind: "bns/create_proposal";
    readonly title: string;
    /** The transaction to be executed when the proposal is accepted */
    readonly rawOption: Uint8Array;
    readonly description: string;
    readonly electionRuleId: Uint8Array;
    /** Unix timestamp when the proposal starts */
    readonly startTime: number;
    /** The author of the proposal must be included in the list of transaction signers. */
    readonly author: Address;
}
export declare function isCreateProposalTx(transaction: LightTransaction): transaction is CreateProposalTx;
export declare type BnsTx = SendTransaction | SwapOfferTransaction | SwapClaimTransaction | SwapAbortTransaction | RegisterUsernameTx | AddAddressToUsernameTx | RemoveAddressFromUsernameTx | CreateMultisignatureTx | UpdateMultisignatureTx | CreateEscrowTx | ReleaseEscrowTx | ReturnEscrowTx | UpdateEscrowPartiesTx | CreateProposalTx;
export declare function isBnsTx(transaction: LightTransaction): transaction is BnsTx;
