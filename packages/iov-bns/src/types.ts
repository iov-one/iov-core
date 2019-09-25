import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  isSendTransaction,
  isSwapAbortTransaction,
  isSwapClaimTransaction,
  isSwapOfferTransaction,
  LightTransaction,
  PubkeyBundle,
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  TimestampTimeout,
} from "@iov/bcp";
import { As } from "type-tagger";

// config (those are not used outside of @iov/bns)

export interface CashConfiguration {
  readonly minimalFee: Amount | null;
}

// Governance

export interface ValidatorProperties {
  readonly power: number;
}

export interface Validator extends ValidatorProperties {
  readonly pubkey: PubkeyBundle;
}

/**
 * An unordered map from validator pubkey address to remaining properies
 *
 * The string key is in the form `ed25519_<pubkey_hex>`
 */
export interface Validators {
  readonly [index: string]: ValidatorProperties;
}

/** Like Elector from the backend but without the address field */
export interface ElectorProperties {
  /** The voting weight of this elector. Max value is 65535 (2^16-1). */
  readonly weight: number;
}

export interface Elector extends ElectorProperties {
  readonly address: Address;
}

/** An unordered map from elector address to remaining properies */
export interface Electors {
  readonly [index: string]: ElectorProperties;
}

export interface Electorate {
  readonly id: number;
  readonly version: number;
  readonly admin: Address;
  readonly title: string;
  readonly electors: Electors;
  /** Sum of all electors' weights */
  readonly totalWeight: number;
}

export interface Fraction {
  readonly numerator: number;
  readonly denominator: number;
}

export interface ElectionRule {
  readonly id: number;
  readonly version: number;
  readonly admin: Address;
  /**
   * The eligible voters in this rule.
   *
   * This is an unversioned ID (see `id` field in weave's VersionedIDRef), meaning the
   * electorate can change over time without changing this ID. When a proposal with this
   * rule is created, the latest version of the electorate will be used.
   */
  readonly electorateId: number;
  readonly title: string;
  /** Voting period in seconds */
  readonly votingPeriod: number;
  readonly threshold: Fraction;
  readonly quorum: Fraction | null;
}

export interface VersionedId {
  readonly id: number;
  readonly version: number;
}

export enum ProposalExecutorResult {
  NotRun,
  Succeeded,
  Failed,
}

export enum ProposalResult {
  Undefined,
  Accepted,
  Rejected,
}

export enum ProposalStatus {
  Submitted,
  Closed,
  Withdrawn,
}

export enum VoteOption {
  Yes,
  No,
  Abstain,
}

export enum ActionKind {
  CreateTextResolution = "gov_create_text_resolution",
  ExecuteProposalBatch = "execute_proposal_batch",
  ReleaseEscrow = "escrow_release",
  Send = "cash_send",
  SetValidators = "validators_apply_diff",
  UpdateElectionRule = "gov_update_election_rule",
  UpdateElectorate = "gov_update_electorate",
}

export interface TallyResult {
  readonly totalYes: number;
  readonly totalNo: number;
  readonly totalAbstain: number;
  readonly totalElectorateWeight: number;
}

export interface CreateTextResolutionAction {
  readonly kind: ActionKind.CreateTextResolution;
  readonly resolution: string;
}

export function isCreateTextResolutionAction(action: ProposalAction): action is CreateTextResolutionAction {
  return action.kind === ActionKind.CreateTextResolution;
}

export interface ExecuteProposalBatchAction {
  readonly kind: ActionKind.ExecuteProposalBatch;
  readonly messages: readonly ProposalAction[];
}

export function isExecuteProposalBatchAction(action: ProposalAction): action is ExecuteProposalBatchAction {
  return action.kind === ActionKind.ExecuteProposalBatch;
}

export interface ReleaseEscrowAction {
  readonly kind: ActionKind.ReleaseEscrow;
  readonly escrowId: number;
  readonly amount: Amount;
}

export function isReleaseEscrowAction(action: ProposalAction): action is ReleaseEscrowAction {
  return action.kind === ActionKind.ReleaseEscrow;
}

export interface SendAction {
  readonly kind: ActionKind.Send;
  readonly sender: Address;
  readonly recipient: Address;
  readonly amount: Amount;
  readonly memo?: string;
}

export function isSendAction(action: ProposalAction): action is SendAction {
  return action.kind === ActionKind.Send;
}

export interface SetValidatorsAction {
  readonly kind: ActionKind.SetValidators;
  readonly validatorUpdates: Validators;
}

export function isSetValidatorsAction(action: ProposalAction): action is SetValidatorsAction {
  return action.kind === ActionKind.SetValidators;
}

export interface UpdateElectionRuleAction {
  readonly kind: ActionKind.UpdateElectionRule;
  readonly electionRuleId: number;
  readonly threshold?: Fraction;
  readonly quorum?: Fraction | null;
  readonly votingPeriod: number;
}

export function isUpdateElectionRuleAction(action: ProposalAction): action is UpdateElectionRuleAction {
  return action.kind === ActionKind.UpdateElectionRule;
}

export interface UpdateElectorateAction {
  readonly kind: ActionKind.UpdateElectorate;
  readonly electorateId: number;
  readonly diffElectors: Electors;
}

export function isUpdateElectorateAction(action: ProposalAction): action is UpdateElectorateAction {
  return action.kind === ActionKind.UpdateElectorate;
}

/** The action to be executed when the proposal is accepted */
export type ProposalAction =
  | CreateTextResolutionAction
  | ExecuteProposalBatchAction
  | ReleaseEscrowAction
  | SendAction
  | SetValidatorsAction
  | UpdateElectorateAction
  | UpdateElectionRuleAction;

export interface Proposal {
  readonly id: number;
  readonly title: string;
  /**
   * The transaction to be executed when the proposal is accepted
   *
   * This is one of the actions from
   * https://htmlpreview.github.io/?https://github.com/iov-one/weave/blob/v0.16.0/docs/proto/index.html#app.ProposalOptions
   */
  readonly action: ProposalAction;
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
  readonly state: TallyResult;
  readonly status: ProposalStatus;
  readonly result: ProposalResult;
  readonly executorResult: ProposalExecutorResult;
}

export interface Vote {
  readonly proposalId: number;
  readonly elector: Elector;
  readonly selection: VoteOption;
}

// username NFT

export interface ChainAddressPair {
  readonly chainId: ChainId;
  readonly address: Address;
}

export interface BnsUsernameNft {
  readonly id: string;
  readonly owner: Address;
  readonly targets: readonly ChainAddressPair[];
}

export interface BnsUsernamesByUsernameQuery {
  readonly username: string;
}

export interface BnsUsernamesByOwnerQuery {
  readonly owner: Address;
}

export type BnsUsernamesQuery = BnsUsernamesByUsernameQuery | BnsUsernamesByOwnerQuery;

export function isBnsUsernamesByUsernameQuery(
  query: BnsUsernamesQuery,
): query is BnsUsernamesByUsernameQuery {
  return typeof (query as BnsUsernamesByUsernameQuery).username !== "undefined";
}

export function isBnsUsernamesByOwnerQuery(query: BnsUsernamesQuery): query is BnsUsernamesByOwnerQuery {
  return typeof (query as BnsUsernamesByOwnerQuery).owner !== "undefined";
}

// Rest

export type PrivkeyBytes = Uint8Array & As<"privkey-bytes">;
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

// Transactions: Usernames

export interface RegisterUsernameTx extends LightTransaction {
  readonly kind: "bns/register_username";
  readonly username: string;
  readonly targets: readonly ChainAddressPair[];
}

export function isRegisterUsernameTx(tx: LightTransaction): tx is RegisterUsernameTx {
  return tx.kind === "bns/register_username";
}

export interface UpdateTargetsOfUsernameTx extends LightTransaction {
  readonly kind: "bns/update_targets_of_username";
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly targets: readonly ChainAddressPair[];
}

export function isUpdateTargetsOfUsernameTx(tx: LightTransaction): tx is UpdateTargetsOfUsernameTx {
  return tx.kind === "bns/update_targets_of_username";
}

export interface TransferUsernameTx extends LightTransaction {
  readonly kind: "bns/transfer_username";
  /** the username to be transferred, must exist on chain */
  readonly username: string;
  readonly newOwner: Address;
}

export function isTransferUsernameTx(tx: LightTransaction): tx is TransferUsernameTx {
  return tx.kind === "bns/transfer_username";
}

// Transactions: Multisignature contracts

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

export function isCreateMultisignatureTx(tx: LightTransaction): tx is CreateMultisignatureTx {
  return tx.kind === "bns/create_multisignature_contract";
}

export interface UpdateMultisignatureTx extends LightTransaction {
  readonly kind: "bns/update_multisignature_contract";
  readonly contractId: Uint8Array;
  readonly participants: readonly Participant[];
  readonly activationThreshold: number;
  readonly adminThreshold: number;
}

export function isUpdateMultisignatureTx(tx: LightTransaction): tx is UpdateMultisignatureTx {
  return tx.kind === "bns/update_multisignature_contract";
}

// Transactions: Escrows

export interface CreateEscrowTx extends LightTransaction {
  readonly kind: "bns/create_escrow";
  readonly sender: Address;
  readonly arbiter: Address;
  readonly recipient: Address;
  readonly amounts: readonly Amount[];
  readonly timeout: TimestampTimeout;
  readonly memo?: string;
}

export function isCreateEscrowTx(tx: LightTransaction): tx is CreateEscrowTx {
  return tx.kind === "bns/create_escrow";
}

export interface ReleaseEscrowTx extends LightTransaction {
  readonly kind: "bns/release_escrow";
  readonly escrowId: number;
  readonly amounts: readonly Amount[];
}

export function isReleaseEscrowTx(tx: LightTransaction): tx is ReleaseEscrowTx {
  return tx.kind === "bns/release_escrow";
}

export interface ReturnEscrowTx extends LightTransaction {
  readonly kind: "bns/return_escrow";
  readonly escrowId: number;
}

export function isReturnEscrowTx(tx: LightTransaction): tx is ReturnEscrowTx {
  return tx.kind === "bns/return_escrow";
}

export interface UpdateEscrowPartiesTx extends LightTransaction {
  readonly kind: "bns/update_escrow_parties";
  readonly escrowId: number;
  readonly sender?: Address;
  readonly arbiter?: Address;
  readonly recipient?: Address;
}

export function isUpdateEscrowPartiesTx(tx: LightTransaction): tx is UpdateEscrowPartiesTx {
  return tx.kind === "bns/update_escrow_parties";
}

// Transactions: Governance

export interface CreateProposalTx extends LightTransaction {
  readonly kind: "bns/create_proposal";
  readonly title: string;
  /**
   * The transaction to be executed when the proposal is accepted
   *
   * This is one of the actions from
   * https://htmlpreview.github.io/?https://github.com/iov-one/weave/blob/v0.16.0/docs/proto/index.html#app.ProposalOptions
   */
  readonly action: ProposalAction;
  readonly description: string;
  readonly electionRuleId: number;
  /** Unix timestamp when the proposal starts */
  readonly startTime: number;
  /** The author of the proposal must be included in the list of transaction signers. */
  readonly author: Address;
}

export function isCreateProposalTx(transaction: LightTransaction): transaction is CreateProposalTx {
  return transaction.kind === "bns/create_proposal";
}

export interface VoteTx extends LightTransaction {
  readonly kind: "bns/vote";
  readonly proposalId: number;
  readonly selection: VoteOption;
}

export function isVoteTx(transaction: LightTransaction): transaction is VoteTx {
  return transaction.kind === "bns/vote";
}

// Transactions: BNS

export type BnsTx =
  // BCP: Token sends
  | SendTransaction
  // BCP: Atomic swaps
  | SwapOfferTransaction
  | SwapClaimTransaction
  | SwapAbortTransaction
  // BNS: Usernames
  | RegisterUsernameTx
  | UpdateTargetsOfUsernameTx
  | TransferUsernameTx
  // BNS: Multisignature contracts
  | CreateMultisignatureTx
  | UpdateMultisignatureTx
  // BNS: Escrows
  | CreateEscrowTx
  | ReleaseEscrowTx
  | ReturnEscrowTx
  | UpdateEscrowPartiesTx
  // BNS: Governance
  | CreateProposalTx
  | VoteTx;

export function isBnsTx(transaction: LightTransaction): transaction is BnsTx {
  if (
    isSendTransaction(transaction) ||
    isSwapOfferTransaction(transaction) ||
    isSwapClaimTransaction(transaction) ||
    isSwapAbortTransaction(transaction)
  ) {
    return true;
  }

  return transaction.kind.startsWith("bns/");
}

export interface MultisignatureTx extends LightTransaction {
  readonly multisig: readonly number[];
}

export function isMultisignatureTx(transaction: LightTransaction): transaction is MultisignatureTx {
  return (
    Array.isArray((transaction as any).multisig) &&
    (transaction as any).multisig.every((id: any) => typeof id === "number")
  );
}
