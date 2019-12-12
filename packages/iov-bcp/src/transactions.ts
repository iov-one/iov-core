import { isNonNullObject, isUint8Array } from "@iov/encoding";
import { ReadonlyDate } from "readonly-date";
import { As } from "type-tagger";

export enum Algorithm {
  Ed25519 = "ed25519",
  Secp256k1 = "secp256k1",
}

export type PubkeyBytes = Uint8Array & As<"pubkey-bytes">;

export interface PubkeyBundle {
  readonly algo: Algorithm;
  readonly data: PubkeyBytes;
}

export function isPubkeyBundle(data: unknown): data is PubkeyBundle {
  return (
    isNonNullObject(data) &&
    ((data as PubkeyBundle).algo === Algorithm.Ed25519 ||
      (data as PubkeyBundle).algo === Algorithm.Secp256k1) &&
    isUint8Array((data as PubkeyBundle).data)
  );
}

/**
 * Compares two objects that conform to the PubkeyBundle interface for equality.
 *
 * This can also be used to compare pairs of derived types in which case all
 * non-PubkeyBundle fields are ignored.
 *
 * @param left the left hand side of the comparison
 * @param right the right hand side of the comparison
 */
export function pubkeyBundleEquals(left: PubkeyBundle, right: PubkeyBundle): boolean {
  return (
    left.algo === right.algo &&
    left.data.length === right.data.length &&
    left.data.every((value, index) => value === right.data[index])
  );
}

/** Used to differentiate a blockchain. Should be alphanumeric or -_/ and unique */
export type ChainId = string & As<"chain-id">;

/** a public key we can identify with on a blockchain */
export interface Identity {
  readonly chainId: ChainId;
  readonly pubkey: PubkeyBundle;
}

export function isIdentity(data: unknown): data is Identity {
  return (
    isNonNullObject(data) &&
    typeof (data as Identity).chainId === "string" &&
    isPubkeyBundle((data as Identity).pubkey)
  );
}

/**
 * Compares two objects that conform to the Identity interface for equality.
 * All additional (non-Identity) fields are ignored.
 *
 * @param left the left hand side of the comparison
 * @param right the right hand side of the comparison
 */
export function identityEquals(left: Identity, right: Identity): boolean {
  return left.chainId === right.chainId && pubkeyBundleEquals(left.pubkey, right.pubkey);
}

export type SignatureBytes = Uint8Array & As<"signature">;

/** An integer in the safe integer range */
export type Nonce = number & As<"nonce">;

// TokenTicker should be 3-4 letters, uppercase
export type TokenTicker = string & As<"token-ticker">;

export type SwapIdBytes = Uint8Array & As<"swap-id">;
export interface SwapId {
  readonly prefix?: string;
  readonly data: SwapIdBytes;
}
export function swapIdEquals(left: SwapId, right: SwapId): boolean {
  return (
    left.prefix === right.prefix &&
    left.data.length === right.data.length &&
    left.data.every((value, index) => value === right.data[index])
  );
}

/**
 * A printable transaction ID in a blockchain-specific format.
 *
 * In Lisk, this is a uint64 number like 3444561236416494115 and in BNS this is an upper
 * hex encoded 20 byte hash like 3A0DB99E82E11DBB9F987EFCD04264305C2CA6F2. Ethereum uses
 * 0x-prefixed hashes like 0xce8145665aa6ce4c7d01aabffbb610efd03de4d84785840d43b000e1b7e785c3
 */
export type TransactionId = string & As<"transaction-id">;

export type SignableBytes = Uint8Array & As<"signable">;

// Specifies which hash function to apply before signing.
// The identity function is indicated using None.
export enum PrehashType {
  None,
  Sha512,
  Sha256,
  Keccak256,
}

export interface SigningJob {
  readonly bytes: SignableBytes;
  readonly prehashType: PrehashType;
}

// NB: use Buffer or String, we should be consistent....
// I figure string if this will be json dumped, but maybe less efficient
export interface FullSignature {
  readonly nonce: Nonce;
  readonly pubkey: PubkeyBundle;
  readonly signature: SignatureBytes;
}

export function isFullSignature(data: unknown): data is FullSignature {
  if (!isNonNullObject(data)) return false;
  const fs = data as FullSignature;
  return typeof fs.nonce === "number" && isPubkeyBundle(fs.pubkey) && isUint8Array(fs.signature);
}

/** A codec specific address encoded as a string */
export type Address = string & As<"address">;

export interface Amount {
  /**
   * The quantity expressed as atomic units.
   *
   * Convert to whole and fractional part using
   *   const whole = amount.quantity.slice(0, -amount.fractionalDigits);
   *   const fractional = amount.quantity.slice(-amount.fractionalDigits);
   * or to a floating point approximation (not safe!)
   *   const approx = whole + fractional / 10**amount.fractionalDigits
   */
  readonly quantity: string;
  /**
   * The number of fractional digits the token supports.
   *
   * A quantity is expressed as atomic units. 10^fractionalDigits of those
   * atomic units make up 1 token.
   *
   * E.g. in Ethereum 10^18 wei are 1 ETH and from the quantity 123000000000000000000
   * the last 18 digits are the fractional part and the rest the wole part.
   */
  readonly fractionalDigits: number;
  readonly tokenTicker: TokenTicker;
}

export function isAmount(data: unknown): data is Amount {
  return (
    isNonNullObject(data) &&
    typeof (data as Amount).quantity === "string" &&
    typeof (data as Amount).fractionalDigits === "number" &&
    typeof (data as Amount).tokenTicker === "string"
  );
}

/** A general interface for blockchain fees */
export interface Fee {
  readonly tokens?: Amount;
  readonly gasPrice?: Amount;
  readonly gasLimit?: string;
  readonly payer?: Address;
}

export function isFee(data: unknown): data is Fee {
  return (
    isNonNullObject(data) &&
    (isAmount((data as Fee).tokens) ||
      (isAmount((data as Fee).gasPrice) && typeof (data as Fee).gasLimit === "string"))
  );
}

/** The basic transaction type all transactions should extend */
export interface UnsignedTransaction {
  /**
   * Kind describes the kind of transaction as a "<domain>/<concrete_type>" tuple.
   *
   * The domain acts as a namespace for the concreate type. Right now we use "bns",
   * "ethereum" and "lisk" for chain-specific transactions. We also use the
   * special domain "bcp" for any kind that can be supported in multiple chains.
   *
   * This should be used for type detection only and not be encoded somewhere. It
   * might be migrated to a Java-style package names like "io.lisk.mainnet" or
   * other way of namespacing later on, so don't use the `kind` property as a value.
   */
  readonly kind: string;
  readonly chainId: ChainId;
  readonly fee?: Fee;
}

export function isUnsignedTransaction(data: unknown): data is UnsignedTransaction {
  if (!isNonNullObject(data)) return false;
  const transaction = data as UnsignedTransaction;
  return (
    typeof transaction.kind === "string" &&
    (transaction.fee === undefined || isFee(transaction.fee)) &&
    typeof transaction.chainId === "string"
  );
}

/** An interface to ensure the transaction property of other types is in sync */
export interface TransactionContainer<T extends UnsignedTransaction> {
  /** The transaction content */
  readonly transaction: T;
}

export type NonEmptyArray<T> = readonly T[] & { readonly 0: T };

/** A signable transaction knows how to serialize itself and how to store signatures */
export interface SignedTransaction<T extends UnsignedTransaction = UnsignedTransaction>
  extends TransactionContainer<T> {
  readonly signatures: NonEmptyArray<FullSignature>;
}

export interface ConfirmedTransaction<T extends UnsignedTransaction> extends TransactionContainer<T> {
  readonly height: number; // the block it was written to
  /** depth of the transaction's block, starting at 1 as soon as transaction is in a block */
  readonly confirmations: number;
  /** a unique identifier (hash of the transaction) */
  readonly transactionId: TransactionId;
  /** application specific data from executing tx (result, code, tags...) */
  readonly result?: Uint8Array;
  /**
   * Application specific logging output in an arbitrary text format that
   * may change at any time.
   */
  readonly log?: string;
}

export interface FailedTransaction {
  /** height of the block that contains the transaction */
  readonly height: number;
  /** a unique identifier (hash of the transaction) */
  readonly transactionId: TransactionId;
  /**
   * Application specific error code
   */
  readonly code: number;
  /**
   * Application specific, human-readable, non-localized error message
   * in an arbitrary text format that may change at any time.
   */
  readonly message?: string;
}

export function isConfirmedTransaction<T extends UnsignedTransaction>(
  transaction: ConfirmedTransaction<T> | FailedTransaction,
): transaction is ConfirmedTransaction<T> {
  return typeof (transaction as any).transaction !== "undefined";
}

export function isFailedTransaction<T extends UnsignedTransaction>(
  transaction: ConfirmedTransaction<T> | FailedTransaction,
): transaction is FailedTransaction {
  return !isConfirmedTransaction(transaction);
}

export type ConfirmedAndSignedTransaction<T extends UnsignedTransaction> = ConfirmedTransaction<T> &
  SignedTransaction<T>;

export function isConfirmedAndSignedTransaction<T extends UnsignedTransaction>(
  transaction: ConfirmedAndSignedTransaction<T> | FailedTransaction,
): transaction is ConfirmedAndSignedTransaction<T> {
  return isConfirmedTransaction(transaction);
}

export interface SendTransaction extends UnsignedTransaction {
  readonly kind: "bcp/send";
  readonly amount: Amount;
  readonly sender: Address;
  readonly senderPubkey?: PubkeyBundle;
  readonly recipient: Address;
  readonly memo?: string;
}

export type SwapTimeout = BlockHeightTimeout | TimestampTimeout;

export interface BlockHeightTimeout {
  /** Absolute block height */
  readonly height: number;
}

export function isBlockHeightTimeout(timeout: SwapTimeout): timeout is BlockHeightTimeout {
  return typeof (timeout as BlockHeightTimeout).height === "number";
}

export interface TimestampTimeout {
  /** Unix timestamp in seconds */
  readonly timestamp: number;
}

export function isTimestampTimeout(timeout: SwapTimeout): timeout is TimestampTimeout {
  return typeof (timeout as TimestampTimeout).timestamp === "number";
}

export function createTimestampTimeout(secondsFromNow: number): TimestampTimeout {
  return { timestamp: Math.floor(ReadonlyDate.now() / 1000) + secondsFromNow };
}

export function isSendTransaction(transaction: UnsignedTransaction): transaction is SendTransaction {
  return (transaction as SendTransaction).kind === "bcp/send";
}
