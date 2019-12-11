import { As } from "type-tagger";
export declare enum Algorithm {
  Ed25519 = "ed25519",
  Secp256k1 = "secp256k1",
}
export declare type PubkeyBytes = Uint8Array & As<"pubkey-bytes">;
export interface PubkeyBundle {
  readonly algo: Algorithm;
  readonly data: PubkeyBytes;
}
export declare function isPubkeyBundle(data: unknown): data is PubkeyBundle;
/**
 * Compares two objects that conform to the PubkeyBundle interface for equality.
 *
 * This can also be used to compare pairs of derived types in which case all
 * non-PubkeyBundle fields are ignored.
 *
 * @param left the left hand side of the comparison
 * @param right the right hand side of the comparison
 */
export declare function pubkeyBundleEquals(left: PubkeyBundle, right: PubkeyBundle): boolean;
/** Used to differentiate a blockchain. Should be alphanumeric or -_/ and unique */
export declare type ChainId = string & As<"chain-id">;
/** a public key we can identify with on a blockchain */
export interface Identity {
  readonly chainId: ChainId;
  readonly pubkey: PubkeyBundle;
}
export declare function isIdentity(data: unknown): data is Identity;
/**
 * Compares two objects that conform to the Identity interface for equality.
 * All additional (non-Identity) fields are ignored.
 *
 * @param left the left hand side of the comparison
 * @param right the right hand side of the comparison
 */
export declare function identityEquals(left: Identity, right: Identity): boolean;
export declare type SignatureBytes = Uint8Array & As<"signature">;
/** An integer in the safe integer range */
export declare type Nonce = number & As<"nonce">;
export declare type TokenTicker = string & As<"token-ticker">;
export declare type SwapIdBytes = Uint8Array & As<"swap-id">;
export interface SwapId {
  readonly prefix?: string;
  readonly data: SwapIdBytes;
}
export declare function swapIdEquals(left: SwapId, right: SwapId): boolean;
/**
 * A printable transaction ID in a blockchain-specific format.
 *
 * In Lisk, this is a uint64 number like 3444561236416494115 and in BNS this is an upper
 * hex encoded 20 byte hash like 3A0DB99E82E11DBB9F987EFCD04264305C2CA6F2. Ethereum uses
 * 0x-prefixed hashes like 0xce8145665aa6ce4c7d01aabffbb610efd03de4d84785840d43b000e1b7e785c3
 */
export declare type TransactionId = string & As<"transaction-id">;
export declare type SignableBytes = Uint8Array & As<"signable">;
export declare enum PrehashType {
  None = 0,
  Sha512 = 1,
  Sha256 = 2,
  Keccak256 = 3,
}
export interface SigningJob {
  readonly bytes: SignableBytes;
  readonly prehashType: PrehashType;
}
export interface FullSignature {
  readonly nonce: Nonce;
  readonly pubkey: PubkeyBundle;
  readonly signature: SignatureBytes;
}
export declare function isFullSignature(data: unknown): data is FullSignature;
/** A codec specific address encoded as a string */
export declare type Address = string & As<"address">;
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
export declare function isAmount(data: unknown): data is Amount;
/** A general interface for blockchain fees */
export interface Fee {
  readonly tokens?: Amount;
  readonly gasPrice?: Amount;
  readonly gasLimit?: string;
  readonly payer?: Address;
}
export declare function isFee(data: unknown): data is Fee;
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
export declare function isUnsignedTransaction(data: unknown): data is UnsignedTransaction;
/** An interface to ensure the transaction property of other types is in sync */
export interface TransactionContainer<T extends UnsignedTransaction> {
  /** The transaction content */
  readonly transaction: T;
}
/** A signable transaction knows how to serialize itself and how to store signatures */
export interface SignedTransaction<T extends UnsignedTransaction = UnsignedTransaction>
  extends TransactionContainer<T> {
  readonly primarySignature: FullSignature;
  /** signatures can be appended as this is signed */
  readonly otherSignatures: readonly FullSignature[];
}
export interface ConfirmedTransaction<T extends UnsignedTransaction> extends TransactionContainer<T> {
  readonly height: number;
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
export declare function isConfirmedTransaction<T extends UnsignedTransaction>(
  transaction: ConfirmedTransaction<T> | FailedTransaction,
): transaction is ConfirmedTransaction<T>;
export declare function isFailedTransaction<T extends UnsignedTransaction>(
  transaction: ConfirmedTransaction<T> | FailedTransaction,
): transaction is FailedTransaction;
export declare type ConfirmedAndSignedTransaction<T extends UnsignedTransaction> = ConfirmedTransaction<T> &
  SignedTransaction<T>;
export declare function isConfirmedAndSignedTransaction<T extends UnsignedTransaction>(
  transaction: ConfirmedAndSignedTransaction<T> | FailedTransaction,
): transaction is ConfirmedAndSignedTransaction<T>;
export interface SendTransaction extends UnsignedTransaction {
  readonly kind: "bcp/send";
  readonly amount: Amount;
  readonly sender: Address;
  readonly senderPubkey?: PubkeyBundle;
  readonly recipient: Address;
  readonly memo?: string;
}
export declare type SwapTimeout = BlockHeightTimeout | TimestampTimeout;
export interface BlockHeightTimeout {
  /** Absolute block height */
  readonly height: number;
}
export declare function isBlockHeightTimeout(timeout: SwapTimeout): timeout is BlockHeightTimeout;
export interface TimestampTimeout {
  /** Unix timestamp in seconds */
  readonly timestamp: number;
}
export declare function isTimestampTimeout(timeout: SwapTimeout): timeout is TimestampTimeout;
export declare function createTimestampTimeout(secondsFromNow: number): TimestampTimeout;
export declare function isSendTransaction(transaction: UnsignedTransaction): transaction is SendTransaction;
