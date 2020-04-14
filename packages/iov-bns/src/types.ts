import {
  Address,
  Algorithm,
  Amount,
  ChainId,
  isSendTransaction,
  isSwapAbortTransaction,
  isSwapClaimTransaction,
  isSwapOfferTransaction,
  PubkeyBundle,
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  TimestampTimeout,
  UnsignedTransaction,
} from "@iov/bcp";
import { As } from "type-tagger";

import * as codecImpl from "./generated/codecimpl";

// Internal (those are not used outside of @iov/bns)

export interface CashConfiguration {
  readonly owner: Address;
  readonly collectorAddress: Address;
  readonly minimalFee: Amount | null;
}

export interface TxFeeConfiguration {
  readonly owner: Address;
  readonly freeBytes: number | null;
  readonly baseFee: Amount | null;
}

export interface MsgFeeConfiguration {
  readonly owner: Address;
  readonly feeAdmin: Address | null;
}

export interface PreRegistrationConfiguration {
  readonly owner: Address;
}

export interface QualityScoreConfiguration {
  readonly owner: Address;
  readonly c: Fraction;
  readonly k: Fraction;
  readonly kp: Fraction;
  readonly q0: Fraction;
  readonly x: Fraction;
  readonly xInf: Fraction;
  readonly xSup: Fraction;
  readonly delta: Fraction;
}

// TermDepositStandardRate represents the horribly named IDepositBonus
export interface TermDepositStandardRate {
  readonly lockinPeriod: number;
  readonly rate: Fraction;
}

export interface TermDepositCustomRate {
  readonly address: Address;
  readonly rate: Fraction;
}

export interface TermDepositConfiguration {
  readonly owner: Address;
  readonly admin: Address | null;

  readonly standardRates: readonly TermDepositStandardRate[]; // represents the horribly named "bonuses"
  readonly customRates: readonly TermDepositCustomRate[]; // represents the horribly named "baseRates"
}

/**
 * The message part of a bnsd.Tx
 *
 * @see https://htmlpreview.github.io/?https://github.com/iov-one/weave/blob/v0.24.0/docs/proto/index.html#bnsd.Tx
 */
export type BnsdTxMsg = Omit<codecImpl.bnsd.ITx, "fees" | "signatures" | "multisig">;

// Accounts NFT

export interface ChainAddressPair {
  readonly chainId: ChainId;
  readonly address: Address;
}

export interface BnsAccountByNameQuery {
  readonly name: string;
}

export interface BnsAccountsByOwnerQuery {
  readonly owner: Address;
}

export interface BnsAccountsByDomainQuery {
  readonly domain: string;
}

export type BnsAccountsQuery = BnsAccountByNameQuery | BnsAccountsByOwnerQuery | BnsAccountsByDomainQuery;

export function isBnsAccountByNameQuery(query: BnsAccountsQuery): query is BnsAccountByNameQuery {
  return typeof (query as BnsAccountByNameQuery).name !== "undefined";
}

export function isBnsAccountsByOwnerQuery(query: BnsAccountsQuery): query is BnsAccountsByOwnerQuery {
  return typeof (query as BnsAccountsByOwnerQuery).owner !== "undefined";
}

export function isBnsAccountsByDomainQuery(query: BnsAccountsQuery): query is BnsAccountsByDomainQuery {
  return typeof (query as BnsAccountsByDomainQuery).domain !== "undefined";
}

export interface BnsDomainByNameQuery {
  readonly name: string;
}

export interface BnsDomainsByAdminQuery {
  readonly admin: Address;
}

export type BnsDomainsQuery = BnsDomainByNameQuery | BnsDomainsByAdminQuery;

export function isBnsDomainByNameQuery(query: BnsDomainsQuery): query is BnsDomainByNameQuery {
  return typeof (query as BnsDomainByNameQuery).name !== "undefined";
}

export function isBnsDomainsByAdminQuery(query: BnsDomainsQuery): query is BnsDomainsByAdminQuery {
  return typeof (query as BnsDomainsByAdminQuery).admin !== "undefined";
}

export interface AccountConfiguration {
  readonly owner: Address;
  readonly validDomain: string;
  readonly validName: string;
  readonly validBlockchainId: string;
  readonly validBlockchainAddress: string;
  readonly domainRenew: number;
  readonly domainGracePeriod: number;
}

export interface AccountMsgFee {
  readonly msgPath: string;
  readonly fee: Amount;
}

export interface AccountNft {
  readonly domain: string;
  readonly name?: string;
  readonly owner: Address;
  readonly validUntil: number;
  readonly targets: readonly ChainAddressPair[];
  readonly certificates: readonly Uint8Array[];
}

export interface Domain {
  readonly domain: string;
  readonly admin: Address;
  readonly broker: Address;
  readonly validUntil: number;
  readonly hasSuperuser: boolean;
  readonly msgFees: readonly AccountMsgFee[];
  readonly accountRenew: number;
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

/**
 * Raw values are used for the JSON representation (e.g. in the wallet to browser extension communication)
 * and must remain unchanged across different semver compatible versions of IOV Core.
 */
export enum VoteOption {
  Yes = "yes",
  No = "no",
  Abstain = "abstain",
}

export enum ActionKind {
  CreateTextResolution = "gov_create_text_resolution",
  ExecuteProposalBatch = "execute_proposal_batch",
  ReleaseEscrow = "escrow_release",
  Send = "cash_send",
  SetMsgFee = "msgfee_set_msg_fee",
  SetValidators = "validators_apply_diff",
  UpdateElectionRule = "gov_update_election_rule",
  UpdateElectorate = "gov_update_electorate",
  ExecuteMigration = "datamigration_execute_migration",
  UpgradeSchema = "migration_upgrade_schema",
  SetMsgFeeConfiguration = "msgfee_update_configuration_msg",
  SetPreRegistrationConfiguration = "preregistration_update_configuration_msg",
  SetQualityScoreConfiguration = "qualityscore_update_configuration_msg",
  SetTermDepositConfiguration = "termdeposit_update_configuration_msg",
  SetTxFeeConfiguration = "txfee_update_configuration_msg",
  SetCashConfiguration = "cash_update_configuration_msg",
  SetAccountConfiguration = "account_update_configuration_msg",
  RegisterDomain = "account_register_domain_msg",
  RenewDomain = "account_renew_domain_msg",
  SetAccountMsgFees = "account_replace_account_msg_fees_msg",
  SetAccountTargets = "account_replace_account_targets_msg",
  AddAccountCertificate = "account_add_account_certificate_msg",
  DeleteAccountCertificate = "account_delete_account_certificate_msg",
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

export interface SetMsgFeeAction {
  readonly kind: ActionKind.SetMsgFee;
  readonly msgPath: string;
  readonly fee: Amount;
}

export function isSetMsgFeeAction(action: ProposalAction): action is SetMsgFeeAction {
  return action.kind === ActionKind.SetMsgFee;
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

export interface ExecuteMigrationAction {
  readonly kind: ActionKind.ExecuteMigration;
  readonly id: string;
}

export function isExecuteMigrationAction(action: ProposalAction): action is ExecuteMigrationAction {
  return action.kind === ActionKind.ExecuteMigration;
}

export interface UpgradeSchemaAction {
  readonly kind: ActionKind.UpgradeSchema;
  readonly pkg: string;
  readonly toVersion: number;
}

export function isUpgradeSchemaAction(action: ProposalAction): action is UpgradeSchemaAction {
  return action.kind === ActionKind.UpgradeSchema;
}

export interface SetMsgFeeConfigurationAction {
  readonly kind: ActionKind.SetMsgFeeConfiguration;
  readonly patch: MsgFeeConfiguration;
}

export function isSetMsgFeeConfigurationAction(
  action: ProposalAction,
): action is SetMsgFeeConfigurationAction {
  return action.kind === ActionKind.SetMsgFeeConfiguration;
}

export interface SetPreRegistrationConfigurationAction {
  readonly kind: ActionKind.SetPreRegistrationConfiguration;
  readonly patch: PreRegistrationConfiguration;
}

export function isSetPreRegistrationConfigurationAction(
  action: ProposalAction,
): action is SetPreRegistrationConfigurationAction {
  return action.kind === ActionKind.SetPreRegistrationConfiguration;
}

export interface SetQualityScoreConfigurationAction {
  readonly kind: ActionKind.SetQualityScoreConfiguration;
  readonly patch: QualityScoreConfiguration;
}

export function isSetQualityScoreConfigurationAction(
  action: ProposalAction,
): action is SetQualityScoreConfigurationAction {
  return action.kind === ActionKind.SetQualityScoreConfiguration;
}

export interface SetTermDepositConfigurationAction {
  readonly kind: ActionKind.SetTermDepositConfiguration;
  readonly patch: TermDepositConfiguration;
}

export function isSetTermDepositConfigurationAction(
  action: ProposalAction,
): action is SetTermDepositConfigurationAction {
  return action.kind === ActionKind.SetTermDepositConfiguration;
}

export interface SetTxFeeConfigurationAction {
  readonly kind: ActionKind.SetTxFeeConfiguration;
  readonly patch: TxFeeConfiguration;
}

export function isSetTxFeeConfigurationAction(action: ProposalAction): action is SetTxFeeConfigurationAction {
  return action.kind === ActionKind.SetTxFeeConfiguration;
}

export interface SetCashConfigurationAction {
  readonly kind: ActionKind.SetCashConfiguration;
  readonly patch: CashConfiguration;
}

export function isSetCashConfigurationAction(action: ProposalAction): action is SetCashConfigurationAction {
  return action.kind === ActionKind.SetCashConfiguration;
}

export interface SetAccountConfigurationAction {
  readonly kind: ActionKind.SetAccountConfiguration;
  readonly patch: AccountConfiguration;
}

export function isSetAccountConfigurationAction(
  action: ProposalAction,
): action is SetAccountConfigurationAction {
  return action.kind === ActionKind.SetAccountConfiguration;
}

export interface RegisterDomainAction {
  readonly kind: ActionKind.RegisterDomain;
  readonly domain: string;
  readonly admin: Address;
  readonly broker?: Address;
  readonly hasSuperuser: boolean;
  readonly msgFees: readonly AccountMsgFee[];
  readonly accountRenew: number;
}

export function isRegisterDomainAction(action: ProposalAction): action is RegisterDomainAction {
  return action.kind === ActionKind.RegisterDomain;
}

export interface RenewDomainAction {
  readonly kind: ActionKind.RenewDomain;
  readonly domain: string;
}

export function isRenewDomainAction(action: ProposalAction): action is RenewDomainAction {
  return action.kind === ActionKind.RenewDomain;
}

export interface SetAccountMsgFeesAction {
  readonly kind: ActionKind.SetAccountMsgFees;
  readonly domain: string;
  readonly newMsgFees: readonly AccountMsgFee[];
}

export function isSetAccountMsgFeesAction(action: ProposalAction): action is SetAccountMsgFeesAction {
  return action.kind === ActionKind.SetAccountMsgFees;
}

export interface SetAccountTargetsAction {
  readonly kind: ActionKind.SetAccountTargets;
  readonly domain: string;
  readonly name: string;
  readonly newTargets: readonly ChainAddressPair[];
}

export function isSetAccountTargetsAction(action: ProposalAction): action is SetAccountTargetsAction {
  return action.kind === ActionKind.SetAccountTargets;
}

export interface AddAccountCertificateAction {
  readonly kind: ActionKind.AddAccountCertificate;
  readonly domain: string;
  readonly name: string;
  readonly certificate: Uint8Array;
}

export function isAddAccountCertificateAction(action: ProposalAction): action is AddAccountCertificateAction {
  return action.kind === ActionKind.AddAccountCertificate;
}

export interface DeleteAccountCertificateAction {
  readonly kind: ActionKind.DeleteAccountCertificate;
  readonly domain: string;
  readonly name: string;
  readonly certificateHash: Uint8Array;
}

export function isDeleteAccountCertificateAction(
  action: ProposalAction,
): action is DeleteAccountCertificateAction {
  return action.kind === ActionKind.DeleteAccountCertificate;
}

/** The action to be executed when the proposal is accepted */
export type ProposalAction =
  | CreateTextResolutionAction
  | ExecuteProposalBatchAction
  | ReleaseEscrowAction
  | SendAction
  | SetMsgFeeAction
  | SetValidatorsAction
  | UpdateElectorateAction
  | UpdateElectionRuleAction
  | ExecuteMigrationAction
  | UpgradeSchemaAction
  | SetMsgFeeConfigurationAction
  | SetPreRegistrationConfigurationAction
  | SetQualityScoreConfigurationAction
  | SetTermDepositConfigurationAction
  | SetTxFeeConfigurationAction
  | SetCashConfigurationAction
  | SetAccountConfigurationAction
  | RegisterDomainAction
  | RenewDomainAction
  | SetAccountMsgFeesAction
  | SetAccountTargetsAction
  | AddAccountCertificateAction
  | DeleteAccountCertificateAction;

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

export interface RegisterUsernameTx extends UnsignedTransaction {
  readonly kind: "bns/register_username";
  readonly username: string;
  readonly targets: readonly ChainAddressPair[];
}

export function isRegisterUsernameTx(tx: UnsignedTransaction): tx is RegisterUsernameTx {
  return tx.kind === "bns/register_username";
}

export interface UpdateTargetsOfUsernameTx extends UnsignedTransaction {
  readonly kind: "bns/update_targets_of_username";
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly targets: readonly ChainAddressPair[];
}

export function isUpdateTargetsOfUsernameTx(tx: UnsignedTransaction): tx is UpdateTargetsOfUsernameTx {
  return tx.kind === "bns/update_targets_of_username";
}

export interface TransferUsernameTx extends UnsignedTransaction {
  readonly kind: "bns/transfer_username";
  /** the username to be transferred, must exist on chain */
  readonly username: string;
  readonly newOwner: Address;
}

export function isTransferUsernameTx(tx: UnsignedTransaction): tx is TransferUsernameTx {
  return tx.kind === "bns/transfer_username";
}

// Transactions: Accounts

export interface UpdateAccountConfigurationTx extends UnsignedTransaction {
  readonly kind: "bns/update_account_configuration";
  readonly configuration: AccountConfiguration;
}

export function isUpdateAccountConfigurationTx(tx: UnsignedTransaction): tx is UpdateAccountConfigurationTx {
  return tx.kind === "bns/update_account_configuration";
}

export interface RegisterDomainTx extends UnsignedTransaction {
  readonly kind: "bns/register_domain";
  readonly domain: string;
  readonly admin: Address;
  readonly hasSuperuser: boolean;
  readonly broker?: Address;
  readonly msgFees: readonly AccountMsgFee[];
  readonly accountRenew: number;
}

export function isRegisterDomainTx(tx: UnsignedTransaction): tx is RegisterDomainTx {
  return tx.kind === "bns/register_domain";
}

export interface TransferDomainTx extends UnsignedTransaction {
  readonly kind: "bns/transfer_domain";
  readonly domain: string;
  readonly newAdmin: Address;
}

export function isTransferDomainTx(tx: UnsignedTransaction): tx is TransferDomainTx {
  return tx.kind === "bns/transfer_domain";
}

export interface RenewDomainTx extends UnsignedTransaction {
  readonly kind: "bns/renew_domain";
  readonly domain: string;
}

export function isRenewDomainTx(tx: UnsignedTransaction): tx is RenewDomainTx {
  return tx.kind === "bns/renew_domain";
}

export interface DeleteDomainTx extends UnsignedTransaction {
  readonly kind: "bns/delete_domain";
  readonly domain: string;
}

export function isDeleteDomainTx(tx: UnsignedTransaction): tx is DeleteDomainTx {
  return tx.kind === "bns/delete_domain";
}

export interface RegisterAccountTx extends UnsignedTransaction {
  readonly kind: "bns/register_account";
  readonly domain: string;
  readonly name: string;
  readonly owner: Address;
  readonly targets: readonly ChainAddressPair[];
  readonly broker?: Address;
}

export function isRegisterAccountTx(tx: UnsignedTransaction): tx is RegisterAccountTx {
  return tx.kind === "bns/register_account";
}

export interface TransferAccountTx extends UnsignedTransaction {
  readonly kind: "bns/transfer_account";
  readonly domain: string;
  readonly name: string;
  readonly newOwner: Address;
}

export function isTransferAccountTx(tx: UnsignedTransaction): tx is TransferAccountTx {
  return tx.kind === "bns/transfer_account";
}

export interface ReplaceAccountTargetsTx extends UnsignedTransaction {
  readonly kind: "bns/replace_account_targets";
  readonly domain: string;
  readonly name: string | undefined;
  readonly newTargets: readonly ChainAddressPair[];
}

export function isReplaceAccountTargetsTx(tx: UnsignedTransaction): tx is ReplaceAccountTargetsTx {
  return tx.kind === "bns/replace_account_targets";
}

export interface DeleteAccountTx extends UnsignedTransaction {
  readonly kind: "bns/delete_account";
  readonly domain: string;
  readonly name: string;
}

export function isDeleteAccountTx(tx: UnsignedTransaction): tx is DeleteAccountTx {
  return tx.kind === "bns/delete_account";
}

export interface DeleteAllAccountsTx extends UnsignedTransaction {
  readonly kind: "bns/delete_all_accounts";
  readonly domain: string;
}

export function isDeleteAllAccountsTx(tx: UnsignedTransaction): tx is DeleteAllAccountsTx {
  return tx.kind === "bns/delete_all_accounts";
}

export interface RenewAccountTx extends UnsignedTransaction {
  readonly kind: "bns/renew_account";
  readonly domain: string;
  readonly name: string;
}

export function isRenewAccountTx(tx: UnsignedTransaction): tx is RenewAccountTx {
  return tx.kind === "bns/renew_account";
}

export interface AddAccountCertificateTx extends UnsignedTransaction {
  readonly kind: "bns/add_account_certificate";
  readonly domain: string;
  readonly name: string;
  readonly certificate: Uint8Array;
}

export function isAddAccountCertificateTx(tx: UnsignedTransaction): tx is AddAccountCertificateTx {
  return tx.kind === "bns/add_account_certificate";
}

export interface ReplaceAccountMsgFeesTx extends UnsignedTransaction {
  readonly kind: "bns/replace_account_msg_fees";
  readonly domain: string;
  readonly newMsgFees: readonly AccountMsgFee[];
}

export function isReplaceAccountMsgFeesTx(tx: UnsignedTransaction): tx is ReplaceAccountMsgFeesTx {
  return tx.kind === "bns/replace_account_msg_fees";
}

export interface DeleteAccountCertificateTx extends UnsignedTransaction {
  readonly kind: "bns/delete_account_certificate";
  readonly domain: string;
  readonly name: string;
  readonly certificateHash: Uint8Array;
}

export function isDeleteAccountCertificateTx(tx: UnsignedTransaction): tx is DeleteAccountCertificateTx {
  return tx.kind === "bns/delete_account_certificate";
}

// Transactions: Multisignature contracts

export interface Participant {
  readonly address: Address;
  readonly weight: number;
}

export interface CreateMultisignatureTx extends UnsignedTransaction {
  readonly kind: "bns/create_multisignature_contract";
  readonly participants: readonly Participant[];
  readonly activationThreshold: number;
  readonly adminThreshold: number;
}

export function isCreateMultisignatureTx(tx: UnsignedTransaction): tx is CreateMultisignatureTx {
  return tx.kind === "bns/create_multisignature_contract";
}

export interface UpdateMultisignatureTx extends UnsignedTransaction {
  readonly kind: "bns/update_multisignature_contract";
  readonly contractId: number;
  readonly participants: readonly Participant[];
  readonly activationThreshold: number;
  readonly adminThreshold: number;
}

export function isUpdateMultisignatureTx(tx: UnsignedTransaction): tx is UpdateMultisignatureTx {
  return tx.kind === "bns/update_multisignature_contract";
}

// Transactions: Escrows

export interface CreateEscrowTx extends UnsignedTransaction {
  readonly kind: "bns/create_escrow";
  readonly sender: Address;
  readonly arbiter: Address;
  readonly recipient: Address;
  readonly amounts: readonly Amount[];
  readonly timeout: TimestampTimeout;
  readonly memo?: string;
}

export function isCreateEscrowTx(tx: UnsignedTransaction): tx is CreateEscrowTx {
  return tx.kind === "bns/create_escrow";
}

export interface ReleaseEscrowTx extends UnsignedTransaction {
  readonly kind: "bns/release_escrow";
  readonly escrowId: number;
  readonly amounts: readonly Amount[];
}

export function isReleaseEscrowTx(tx: UnsignedTransaction): tx is ReleaseEscrowTx {
  return tx.kind === "bns/release_escrow";
}

export interface ReturnEscrowTx extends UnsignedTransaction {
  readonly kind: "bns/return_escrow";
  readonly escrowId: number;
}

export function isReturnEscrowTx(tx: UnsignedTransaction): tx is ReturnEscrowTx {
  return tx.kind === "bns/return_escrow";
}

export interface UpdateEscrowPartiesTx extends UnsignedTransaction {
  readonly kind: "bns/update_escrow_parties";
  readonly escrowId: number;
  readonly sender?: Address;
  readonly arbiter?: Address;
  readonly recipient?: Address;
}

export function isUpdateEscrowPartiesTx(tx: UnsignedTransaction): tx is UpdateEscrowPartiesTx {
  return tx.kind === "bns/update_escrow_parties";
}

// Transactions: Governance

export interface CreateProposalTx extends UnsignedTransaction {
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

export function isCreateProposalTx(transaction: UnsignedTransaction): transaction is CreateProposalTx {
  return transaction.kind === "bns/create_proposal";
}

export interface VoteTx extends UnsignedTransaction {
  readonly kind: "bns/vote";
  readonly proposalId: number;
  readonly selection: VoteOption;
  /**
   * Voter should be set explicitly to avoid falling back to the first signer,
   * which is potentially insecure. When encoding a new transaction, this field
   * is required. Not all transaction from blockchain history have a voter set.
   */
  readonly voter: Address | null;
}

export function isVoteTx(transaction: UnsignedTransaction): transaction is VoteTx {
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
  // BNS: Accounts
  | UpdateAccountConfigurationTx
  | RegisterDomainTx
  | TransferDomainTx
  | RenewDomainTx
  | DeleteDomainTx
  | RegisterAccountTx
  | TransferAccountTx
  | ReplaceAccountTargetsTx
  | DeleteAccountTx
  | DeleteAllAccountsTx
  | RenewAccountTx
  | AddAccountCertificateTx
  | ReplaceAccountMsgFeesTx
  | DeleteAccountCertificateTx
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

export function isBnsTx(transaction: UnsignedTransaction): transaction is BnsTx {
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

export interface MultisignatureTx extends UnsignedTransaction {
  readonly multisig: readonly number[];
}

export function isMultisignatureTx(transaction: UnsignedTransaction): transaction is MultisignatureTx {
  return (
    Array.isArray((transaction as any).multisig) &&
    (transaction as any).multisig.every((id: any) => typeof id === "number")
  );
}
