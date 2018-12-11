import * as Long from "long";
import { As } from "type-tagger";

import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/base-types";
import {
  Address,
  Amount,
  FullSignature,
  Nonce,
  SendTransaction,
  SwapClaimTransaction,
  SwapCounterTransaction,
  SwapOfferTransaction,
  SwapTimeoutTransaction,
  TokenTicker,
  UnsignedTransaction,
} from "@iov/bcp-types";

import { Int53 } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";

export interface ChainAddressPair {
  readonly chainId: ChainId;
  readonly address: Address;
}

// NFTs

/** raw address type used to encode NFT owners */
export type BnsAddressBytes = Uint8Array & As<"bns-address-bytes">;

// blockchain NFT

export interface BnsBlockchainNft {
  readonly id: string;
  readonly owner: BnsAddressBytes;
  /**
   * The registered chain information
   *
   * Fields as defined in https://github.com/iov-one/bns-spec/blob/master/docs/data/ObjectDefinitions.rst#chain
   */
  readonly chain: {
    readonly chainId: ChainId;
    readonly name: string;
    readonly enabled: boolean;
    readonly production: boolean;
    readonly networkId: string | undefined;
    readonly mainTickerId: TokenTicker | undefined;
  };
  readonly codecName: string;
  readonly codecConfig: string;
}

export interface BnsBlockchainsByChainIdQuery {
  readonly chainId: ChainId;
}

export type BnsBlockchainsQuery = BnsBlockchainsByChainIdQuery;

export function isBnsBlockchainsByChainIdQuery(
  query: BnsBlockchainsQuery,
): query is BnsBlockchainsByChainIdQuery {
  return typeof (query as BnsBlockchainsByChainIdQuery).chainId !== "undefined";
}

// username NFT

export interface BnsUsernameNft {
  readonly id: string;
  readonly owner: BnsAddressBytes;
  readonly addresses: ReadonlyArray<ChainAddressPair>;
}

export interface BnsUsernamesByUsernameQuery {
  readonly username: string;
}

export interface BnsUsernamesByOwnerAddressQuery {
  readonly owner: Address;
}

export interface BnsUsernamesByChainAndAddressQuery {
  readonly chain: ChainId;
  readonly address: Address;
}

export type BnsUsernamesQuery =
  | BnsUsernamesByUsernameQuery
  | BnsUsernamesByOwnerAddressQuery
  | BnsUsernamesByChainAndAddressQuery;

export function isBnsUsernamesByUsernameQuery(
  query: BnsUsernamesQuery,
): query is BnsUsernamesByUsernameQuery {
  return typeof (query as BnsUsernamesByUsernameQuery).username !== "undefined";
}

export function isBnsUsernamesByOwnerAddressQuery(
  query: BnsUsernamesQuery,
): query is BnsUsernamesByOwnerAddressQuery {
  return typeof (query as BnsUsernamesByOwnerAddressQuery).owner !== "undefined";
}

export function isBnsUsernamesByChainAndAddressQuery(
  query: BnsUsernamesQuery,
): query is BnsUsernamesByChainAndAddressQuery {
  return (
    typeof (query as BnsUsernamesByChainAndAddressQuery).chain !== "undefined" &&
    typeof (query as BnsUsernamesByChainAndAddressQuery).address !== "undefined"
  );
}

// Rest

export type PrivateKeyBytes = Uint8Array & As<"private-key">;
export interface PrivateKeyBundle {
  readonly algo: Algorithm;
  readonly data: PrivateKeyBytes;
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

export function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PublicKeyBundle {
  if (publicKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: publicKey.ed25519 as PublicKeyBytes,
    };
  } else {
    throw new Error("Unknown public key algorithm");
  }
}

export function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivateKeyBundle {
  if (privateKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: privateKey.ed25519 as PrivateKeyBytes,
    };
  } else {
    throw new Error("Unknown private key algorithm");
  }
}

export const decodeSignature = (signature: codecImpl.crypto.ISignature): SignatureBytes => {
  if (signature.ed25519) {
    return signature.ed25519 as SignatureBytes;
  } else {
    throw new Error("Unknown private key algorithm");
  }
};

export const decodeFullSig = (sig: codecImpl.sigs.IStdSignature): FullSignature => ({
  nonce: asInt53(sig.sequence) as Nonce,
  pubkey: decodePubkey(ensure(sig.pubkey)),
  signature: decodeSignature(ensure(sig.signature)),
});

export const asNumber = (maybeLong: Long | number | null | undefined): number => {
  if (!maybeLong) {
    return 0;
  } else if (typeof maybeLong === "number") {
    return maybeLong;
  } else {
    return maybeLong.toInt();
  }
};

export function asInt53(input: Long | number | null | undefined): Int53 {
  if (!input) {
    return new Int53(0);
  } else if (typeof input === "number") {
    return new Int53(input);
  } else {
    return Int53.fromString(input.toString());
  }
}

export const ensure = <T>(maybe: T | null | undefined, msg?: string): T => {
  if (maybe === null || maybe === undefined) {
    throw new Error("missing " + (msg || "field"));
  }
  return maybe;
};

// transactions

/**
 * BNS transaction kinds.
 *
 * Raw values are used for type detection only and can change at any time.
 */
export enum TransactionKind {
  AddAddressToUsername = "add_address_to_username",
  Send = "send",
  /** @deprecated see SetNameTx */
  SetName = "set_name",
  SwapOffer = "swap_offer",
  SwapCounter = "swap_counter",
  SwapClaim = "swap_claim",
  SwapTimeout = "swap_timeout",
  RegisterBlockchain = "register_blockchain",
  RegisterUsername = "register_username",
  RemoveAddressFromUsername = "remove_address_from_username",
}

const bnsDomain = "bns";

export interface BnsTx extends UnsignedTransaction {
  readonly kind: TransactionKind;
}

export interface AddAddressToUsernameTx extends BnsTx {
  readonly kind: TransactionKind.AddAddressToUsername;
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly payload: ChainAddressPair;
}

export interface SendTx extends SendTransaction, BnsTx {
  readonly kind: TransactionKind.Send;
  readonly amount: Amount;
  readonly recipient: Address;
  readonly memo?: string;
}

/**
 * Associates a simple name to an account on a weave-based blockchain.
 *
 * @deprecated will be dropped in favour of RegisterUsernameTx
 */
export interface SetNameTx extends BnsTx {
  readonly kind: TransactionKind.SetName;
  readonly name: string;
}

export interface SwapOfferTx extends SwapOfferTransaction, BnsTx {
  readonly kind: TransactionKind.SwapOffer;
}

export interface SwapCounterTx extends SwapCounterTransaction, BnsTx {
  readonly kind: TransactionKind.SwapCounter;
}

export interface SwapClaimTx extends SwapClaimTransaction, BnsTx {
  readonly kind: TransactionKind.SwapClaim;
}

export interface SwapTimeoutTx extends SwapTimeoutTransaction, BnsTx {
  readonly kind: TransactionKind.SwapTimeout;
}

export interface RegisterBlockchainTx extends BnsTx {
  readonly kind: TransactionKind.RegisterBlockchain;
  /**
   * The chain to be registered
   *
   * Fields as defined in https://github.com/iov-one/bns-spec/blob/master/docs/data/ObjectDefinitions.rst#chain
   */
  readonly chain: {
    readonly chainId: ChainId;
    readonly name: string;
    readonly enabled: boolean;
    readonly production: boolean;

    readonly networkId?: string;
    readonly mainTickerId?: TokenTicker;
  };
  readonly codecName: string;
  readonly codecConfig: string;
}

export interface RegisterUsernameTx extends BnsTx {
  readonly kind: TransactionKind.RegisterUsername;
  readonly username: string;
  readonly addresses: ReadonlyArray<ChainAddressPair>;
}

export interface RemoveAddressFromUsernameTx extends BnsTx {
  readonly kind: TransactionKind.RemoveAddressFromUsername;
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly payload: ChainAddressPair;
}

export function isBnsTx(transaction: UnsignedTransaction): transaction is BnsTx {
  return transaction.domain === bnsDomain;
}

export function isAddAddressToUsernameTx(
  transaction: UnsignedTransaction,
): transaction is AddAddressToUsernameTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.AddAddressToUsername;
}

export function isSendTx(transaction: UnsignedTransaction): transaction is SendTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.Send;
}

export function isSetNameTx(transaction: UnsignedTransaction): transaction is SetNameTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.SetName;
}

export function isSwapOfferTx(transaction: UnsignedTransaction): transaction is SwapOfferTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.SwapOffer;
}

export function isSwapCounterTx(transaction: UnsignedTransaction): transaction is SwapCounterTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.SwapCounter;
}

export function isSwapClaimTx(transaction: UnsignedTransaction): transaction is SwapClaimTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.SwapClaim;
}

export function isSwapTimeoutTx(transaction: UnsignedTransaction): transaction is SwapTimeoutTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.SwapTimeout;
}

export function isRegisterBlockchainTx(
  transaction: UnsignedTransaction,
): transaction is RegisterBlockchainTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.RegisterBlockchain;
}

export function isRegisterUsernameTx(transaction: UnsignedTransaction): transaction is RegisterUsernameTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.RegisterUsername;
}

export function isRemoveAddressFromUsernameTx(
  transaction: UnsignedTransaction,
): transaction is RemoveAddressFromUsernameTx {
  return isBnsTx(transaction) && transaction.kind === TransactionKind.RemoveAddressFromUsername;
}
