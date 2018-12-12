import { As } from "type-tagger";
import { ChainId, PublicKeyBundle } from "@iov/base-types";
import { Int53 } from "@iov/encoding";
import { Address } from "./signables";
export declare type Nonce = Int53 & As<"nonce">;
export declare type TokenTicker = string & As<"token-ticker">;
export declare type SwapIdBytes = Uint8Array & As<"swap-id">;
export declare type SwapIdString = string & As<"swap-id">;
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
     * The number of fractionl digits the token supports.
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
/** The basic transaction type all transactions should extend */
export interface UnsignedTransaction {
    /**
     * The domain in which the concrete transaction is valid
     *
     * This should be used for type detection only and not be encoded somewhere.
     * Right now we use "bns", "ethereum", "lisk" and "rise" but this could also
     * be migrated to a Java-style package names like "io.lisk.mainnet" later on.
     *
     * We also use the special domain "bcp" for any kind that can be supported in multiple chains
     */
    readonly domain: string;
    /**
     * kind is the type of transaction (send, setName, etc)
     * A (domain, kind) pair will uniquely define the expected shape of any transaction type
     */
    readonly kind: string;
    /** the chain on which the transaction should be valid */
    readonly chainId: ChainId;
    readonly fee?: Amount;
    readonly gasPrice?: Amount;
    readonly gasLimit?: Amount;
    readonly signer: PublicKeyBundle;
}
export interface SendTransaction extends UnsignedTransaction {
    readonly domain: "bcp";
    readonly kind: "send";
    readonly amount: Amount;
    readonly recipient: Address;
    readonly memo?: string;
}
export interface SwapOfferTransaction extends UnsignedTransaction {
    readonly kind: "swap_offer";
    readonly amount: ReadonlyArray<Amount>;
    readonly recipient: Address;
    /** absolute block height at which the offer times out */
    readonly timeout: number;
    readonly preimage: Uint8Array;
}
export interface SwapCounterTransaction extends UnsignedTransaction {
    readonly kind: "swap_counter";
    readonly amount: ReadonlyArray<Amount>;
    readonly recipient: Address;
    /** absolute block height at which the counter offer times out */
    readonly timeout: number;
    readonly hashCode: Uint8Array;
    readonly memo?: string;
}
export interface SwapClaimTransaction extends UnsignedTransaction {
    readonly kind: "swap_claim";
    readonly preimage: Uint8Array;
    readonly swapId: SwapIdBytes;
}
export interface SwapTimeoutTransaction extends UnsignedTransaction {
    readonly kind: "swap_timeout";
    readonly swapId: SwapIdBytes;
}
export declare function isSendTransaction(transaction: UnsignedTransaction): transaction is SendTransaction;
export declare function isSwapOfferTransaction(transaction: UnsignedTransaction): transaction is SwapOfferTransaction;
export declare function isSwapCounterTransaction(transaction: UnsignedTransaction): transaction is SwapCounterTransaction;
export declare function isSwapClaimTransaction(transaction: UnsignedTransaction): transaction is SwapClaimTransaction;
export declare function isSwapTimeoutTransaction(transaction: UnsignedTransaction): transaction is SwapTimeoutTransaction;
