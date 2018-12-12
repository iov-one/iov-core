import { As } from "type-tagger";

import { ChainId, PublicKeyBundle } from "@iov/base-types";
import { Int53 } from "@iov/encoding";

import { Address } from "./signables";

export type Nonce = Int53 & As<"nonce">;

// TokenTicker should be 3-4 letters, uppercase
export type TokenTicker = string & As<"token-ticker">;

export type SwapIdBytes = Uint8Array & As<"swap-id">;
export type SwapIdString = string & As<"swap-id">;

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
   */
  readonly domain: string;
  /** the chain on which the transaction should be valid */
  readonly chainId: ChainId;
  readonly fee?: Amount;
  readonly gasPrice?: Amount;
  readonly gasLimit?: Amount;
  // signer needs to be a PublicKey as we use that to as an identifier to the Keyring for lookup
  readonly signer: PublicKeyBundle;
}

export interface SendTransaction extends UnsignedTransaction {
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
  readonly hashCode: Uint8Array; // pulled from the offer transaction
  readonly memo?: string;
}

export interface SwapClaimTransaction extends UnsignedTransaction {
  readonly kind: "swap_claim";
  readonly preimage: Uint8Array;
  readonly swapId: SwapIdBytes; // pulled from the offer transaction
}

export interface SwapTimeoutTransaction extends UnsignedTransaction {
  readonly kind: "swap_timeout";
  readonly swapId: SwapIdBytes; // pulled from the offer transaction
}

export function isSendTransaction(transaction: UnsignedTransaction): transaction is SendTransaction {
  return (transaction as SendTransaction).kind === "send";
}

export function isSwapOfferTransaction(
  transaction: UnsignedTransaction,
): transaction is SwapOfferTransaction {
  return (transaction as SwapOfferTransaction).kind === "swap_offer";
}

export function isSwapCounterTransaction(
  transaction: UnsignedTransaction,
): transaction is SwapCounterTransaction {
  return (transaction as SwapCounterTransaction).kind === "swap_counter";
}

export function isSwapClaimTransaction(
  transaction: UnsignedTransaction,
): transaction is SwapClaimTransaction {
  return (transaction as SwapClaimTransaction).kind === "swap_claim";
}

export function isSwapTimeoutTransaction(
  transaction: UnsignedTransaction,
): transaction is SwapTimeoutTransaction {
  return (transaction as SwapTimeoutTransaction).kind === "swap_timeout";
}
