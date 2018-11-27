import { As } from "type-tagger";

import { ChainId, PublicKeyBundle } from "@iov/base-types";
import { Int53 } from "@iov/encoding";

import { Address } from "./signables";

export type Nonce = Int53 & As<"nonce">;

// TODO: can't we just make this a number (block height?)
export type TtlBytes = Uint8Array & As<"ttl">;

// TokenTicker should be 3-4 letters, uppercase
export type TokenTicker = string & As<"token-ticker">;

export type SwapIdBytes = Uint8Array & As<"swap-id">;
export type SwapIdString = string & As<"swap-id">;

// TODO: we may want to make this a union type BNSName | PublicKey | Address
// but waiting on clarity on BNS spec, for now simplest working solution...
export type RecipientId = Address;

export interface Amount {
  /**
   * The quantity expressed as atimic units.
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

export interface ChainAddressPair {
  readonly chainId: ChainId;
  readonly address: Address;
}

export enum TransactionKind {
  AddAddressToUsername,
  Send,
  /** @deprecated see SetNameTx */
  SetName,
  SwapOffer,
  SwapCounter,
  SwapClaim,
  SwapTimeout,
  RegisterBlockchain,
  RegisterUsername,
  RemoveAddressFromUsername,
}

export interface BaseTx {
  /** the chain on which the transaction should be valid */
  readonly chainId: ChainId;
  readonly fee?: Amount;
  readonly gasPrice?: Amount;
  readonly gasLimit?: Amount;
  // signer needs to be a PublicKey as we use that to as an identifier to the Keyring for lookup
  readonly signer: PublicKeyBundle;
  readonly ttl?: TtlBytes;
}

export interface AddAddressToUsernameTx extends BaseTx {
  readonly kind: TransactionKind.AddAddressToUsername;
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly payload: ChainAddressPair;
}

export interface SendTx extends BaseTx {
  readonly kind: TransactionKind.Send;
  readonly amount: Amount;
  readonly recipient: RecipientId;
  readonly memo?: string;
}

/**
 * Associates a simple name to an account on a weave-based blockchain.
 *
 * @deprecated will be dropped in favour of RegisterUsernameTx
 */
export interface SetNameTx extends BaseTx {
  readonly kind: TransactionKind.SetName;
  readonly name: string;
}

export interface SwapOfferTx extends BaseTx {
  readonly kind: TransactionKind.SwapOffer;
  readonly amount: ReadonlyArray<Amount>;
  readonly recipient: RecipientId;
  readonly timeout: number; // number of blocks in the future
  readonly preimage: Uint8Array;
}

export interface SwapCounterTx extends BaseTx {
  readonly kind: TransactionKind.SwapCounter;
  readonly amount: ReadonlyArray<Amount>;
  readonly recipient: RecipientId;
  readonly timeout: number; // number of blocks in the future
  readonly hashCode: Uint8Array; // pulled from the offer transaction
  readonly memo?: string;
}

export interface SwapClaimTx extends BaseTx {
  readonly kind: TransactionKind.SwapClaim;
  readonly preimage: Uint8Array;
  readonly swapId: SwapIdBytes; // pulled from the offer transaction
}

export interface SwapTimeoutTx extends BaseTx {
  readonly kind: TransactionKind.SwapTimeout;
  readonly swapId: SwapIdBytes; // pulled from the offer transaction
}

export interface RegisterBlockchainTx extends BaseTx {
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

export interface RegisterUsernameTx extends BaseTx {
  readonly kind: TransactionKind.RegisterUsername;
  readonly username: string;
  readonly addresses: ReadonlyArray<ChainAddressPair>;
}

export interface RemoveAddressFromUsernameTx extends BaseTx {
  readonly kind: TransactionKind.RemoveAddressFromUsername;
  /** the username to be updated, must exist on chain */
  readonly username: string;
  readonly payload: ChainAddressPair;
}

export type UnsignedTransaction =
  | AddAddressToUsernameTx
  | SendTx
  | SetNameTx
  | SwapOfferTx
  | SwapCounterTx
  | SwapClaimTx
  | SwapTimeoutTx
  | RegisterBlockchainTx
  | RegisterUsernameTx
  | RemoveAddressFromUsernameTx;
