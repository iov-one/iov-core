import { As } from "type-tagger";
import { Int53 } from "@iov/encoding";
import { Preimage } from "./atomicswaptypes";
export declare enum Algorithm {
    Ed25519 = "ed25519",
    Secp256k1 = "secp256k1"
}
export declare type PublicKeyBytes = Uint8Array & As<"public-key">;
export interface PublicKeyBundle {
    readonly algo: Algorithm;
    readonly data: PublicKeyBytes;
}
export declare function isPublicKeyBundle(data: any): data is PublicKeyBundle;
/**
 * Compares two objects that conform to the PublicKeyBundle interface for equality.
 *
 * This can also be used to compare pairs of derived types in which case all
 * non-PublicKeyBundle fields are ignored.
 *
 * @param left the left hand side of the comparison
 * @param right the right hand side of the comparison
 */
export declare function publicKeyBundleEquals(left: PublicKeyBundle, right: PublicKeyBundle): boolean;
/** Used to differentiate a blockchain. Should be alphanumeric or -_/ and unique */
export declare type ChainId = string & As<"chain-id">;
/** a public key we can identify with on a blockchain */
export interface PublicIdentity {
    readonly chainId: ChainId;
    readonly pubkey: PublicKeyBundle;
}
export declare function isPublicIdentity(data: any): data is PublicIdentity;
/**
 * Compares two objects that conform to the PublicIdentity interface for equality.
 * This can also be used to compare pairs of derived types like LocalIdentity/PublicIdentity
 * or LocalIdentity/LocalIdentity in which case all non-PublicIdentity fields are ignored.
 *
 * @param left the left hand side of the comparison
 * @param right the right hand side of the comparison
 */
export declare function publicIdentityEquals(left: PublicIdentity, right: PublicIdentity): boolean;
export declare type SignatureBytes = Uint8Array & As<"signature">;
export declare type Nonce = Int53 & As<"nonce">;
export declare type TokenTicker = string & As<"token-ticker">;
export declare type SwapIdBytes = Uint8Array & As<"swap-id">;
export declare type SwapIdString = string & As<"swap-id">;
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
    Keccak256 = 3
}
export interface SigningJob {
    readonly bytes: SignableBytes;
    readonly prehashType: PrehashType;
}
export interface FullSignature {
    readonly nonce: Nonce;
    readonly pubkey: PublicKeyBundle;
    readonly signature: SignatureBytes;
}
/** A signable transaction knows how to serialize itself and how to store signatures */
export interface SignedTransaction<T extends UnsignedTransaction = UnsignedTransaction> {
    /** transaction is the user request */
    readonly transaction: T;
    readonly primarySignature: FullSignature;
    /** signatures can be appended as this is signed */
    readonly otherSignatures: ReadonlyArray<FullSignature>;
}
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
export declare function isAmount(data: any): data is Amount;
/** A general interface for blockchain fees */
export interface Fee {
    readonly tokens?: Amount;
    readonly gasPrice?: Amount;
    readonly gasLimit?: Amount;
}
export declare function isFee(data: any): data is Fee;
/** The basic transaction type all transactions should extend */
export interface UnsignedTransaction {
    /**
     * Kind describes the kind of transaction as a "<domain>/<concrete_type>" tuple.
     *
     * The domain acts as a namespace for the concreate type. Right now we use "bns",
     * "ethereum", "lisk" and "rise" for chain-specific transactions. We also use the
     * special domain "bcp" for any kind that can be supported in multiple chains.
     *
     * This should be used for type detection only and not be encoded somewhere. It
     * might be migrated to a Java-style package names like "io.lisk.mainnet" or
     * other way of namespacing later on, so don't use the `kind` property as a value.
     */
    readonly kind: string;
    /**
     * The creator of the transaction.
     *
     * This implicitly fixes the chain ID this transaction can be used on.
     */
    readonly creator: PublicIdentity;
    readonly fee?: Fee;
}
export declare function isUnsignedTransaction(data: any): data is UnsignedTransaction;
export interface SendTransaction extends UnsignedTransaction {
    readonly kind: "bcp/send";
    readonly amount: Amount;
    readonly recipient: Address;
    readonly memo?: string;
}
/** A swap offer or a counter offer */
export interface SwapOfferTransaction extends UnsignedTransaction {
    readonly kind: "bcp/swap_offer";
    readonly amounts: ReadonlyArray<Amount>;
    readonly recipient: Address;
    /** absolute block height at which the offer times out */
    readonly timeout: number;
    /**
     * Locally calculated hash of the preimage.
     *
     * This is a SHA256 hash until we have a way to specifiy the hashing algorithm.
     */
    readonly hash: Uint8Array;
    readonly memo?: string;
}
export interface SwapClaimTransaction extends UnsignedTransaction {
    readonly kind: "bcp/swap_claim";
    readonly preimage: Preimage;
    readonly swapId: SwapIdBytes;
}
export interface SwapAbortTransaction extends UnsignedTransaction {
    readonly kind: "bcp/swap_abort";
    readonly swapId: SwapIdBytes;
}
export declare function isSendTransaction(transaction: UnsignedTransaction): transaction is SendTransaction;
export declare function isSwapOfferTransaction(transaction: UnsignedTransaction): transaction is SwapOfferTransaction;
export declare function isSwapClaimTransaction(transaction: UnsignedTransaction): transaction is SwapClaimTransaction;
export declare function isSwapAbortTransaction(transaction: UnsignedTransaction): transaction is SwapAbortTransaction;
