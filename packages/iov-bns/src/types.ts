import { As } from "type-tagger";

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
  SendTransaction,
  SwapAbortTransaction,
  SwapClaimTransaction,
  SwapOfferTransaction,
  TimestampTimeout,
} from "@iov/bcp";

// config (those are not used outside of @iov/bns)

export interface CashConfiguration {
  readonly minimalFee: Amount;
}

// Governance

export interface Elector {
  readonly address: Address;
  /** The voting weight of this elector. Max value is 65535 (2^16-1). */
  readonly weight: number;
}

export interface Electorate {
  readonly version: number;
  readonly admin: Address;
  readonly title: string;
  readonly electors: readonly Elector[];
  /** Sum of all electors' weights */
  readonly totalWeight: number;
}

// username NFT

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
  readonly addresses: readonly ChainAddressPair[];
}

export function isRegisterUsernameTx(tx: LightTransaction): tx is RegisterUsernameTx {
  return tx.kind === "bns/register_username";
}

export interface AddAddressToUsernameTx extends LightTransaction {
  readonly kind: "bns/add_address_to_username";
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly payload: ChainAddressPair;
}

export function isAddAddressToUsernameTx(tx: LightTransaction): tx is AddAddressToUsernameTx {
  return tx.kind === "bns/add_address_to_username";
}

export interface RemoveAddressFromUsernameTx extends LightTransaction {
  readonly kind: "bns/remove_address_from_username";
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly payload: ChainAddressPair;
}

export function isRemoveAddressFromUsernameTx(tx: LightTransaction): tx is RemoveAddressFromUsernameTx {
  return tx.kind === "bns/remove_address_from_username";
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
  readonly escrowId: Uint8Array;
  readonly amounts: readonly Amount[];
}

export function isReleaseEscrowTx(tx: LightTransaction): tx is ReleaseEscrowTx {
  return tx.kind === "bns/release_escrow";
}

export interface ReturnEscrowTx extends LightTransaction {
  readonly kind: "bns/return_escrow";
  readonly escrowId: Uint8Array;
}

export function isReturnEscrowTx(tx: LightTransaction): tx is ReturnEscrowTx {
  return tx.kind === "bns/return_escrow";
}

export interface UpdateEscrowPartiesTx extends LightTransaction {
  readonly kind: "bns/update_escrow_parties";
  readonly escrowId: Uint8Array;
  readonly sender?: Address;
  readonly arbiter?: Address;
  readonly recipient?: Address;
}

export function isUpdateEscrowPartiesTx(tx: LightTransaction): tx is UpdateEscrowPartiesTx {
  return tx.kind === "bns/update_escrow_parties";
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
  | AddAddressToUsernameTx
  | RemoveAddressFromUsernameTx
  // BNS: Multisignature contracts
  | CreateMultisignatureTx
  | UpdateMultisignatureTx
  // BNS: Escrows
  | CreateEscrowTx
  | ReleaseEscrowTx
  | ReturnEscrowTx
  | UpdateEscrowPartiesTx;

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
