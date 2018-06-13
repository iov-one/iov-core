import * as Long from "long";
import { AddressBytes, PublicKeyBundle } from "./keys";

declare const NonceSymbol: unique symbol;
export type Nonce = typeof NonceSymbol & Long;

// TODO: can't we just make this a number (block height?)
declare const TTLSymbol: unique symbol;
type TTL = typeof TTLSymbol;
export type TTLBytes = TTL & Uint8Array;
export type TTLString = TTL & string;

// TokenTicker should be 3-4 letters, uppercase
declare const TokenTickerSymbol: unique symbol;
export type TokenTicker = typeof TokenTickerSymbol & string;

// ChainID is used to differentiate a blockchain
// should be alphanumeric or -_/ and unique
declare const ChainSymbol: unique symbol;
export type ChainID = typeof ChainSymbol & string;

declare const SwapIDSymbol: unique symbol;
type SwapID = typeof SwapIDSymbol;
export type SwapIDBytes = SwapID & Uint8Array;
export type SwapIDString = SwapID & string;

// TODO: we may want to make this a union type BNSName | PublicKey | Address
// but waiting on clarity on BNS spec, for now simplest working solution...
export type RecipientId = AddressBytes;

export interface FungibleToken {
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: TokenTicker;
}

export const enum TransactionKind {
  SEND = "send",
  SET_NAME = "set_name",
  SWAP_OFFER = "swap_offer",
  SWAP_COUNTER = "swap_counter",
  SWAP_CLAIM = "swap_claim",
  SWAP_TIMEOUT = "swap_timeout",
}

export interface BaseTx {
  readonly chainId: ChainID;
  readonly fee?: FungibleToken;
  // signer needs to be a PublicKey as we use that to as an identifier to the Keyring for lookup
  readonly signer: PublicKeyBundle;
  readonly ttl?: TTLBytes;
}

export interface SendTx extends BaseTx {
  readonly kind: TransactionKind.SEND;
  readonly amount: FungibleToken;
  readonly recipient: RecipientId;
  readonly memo?: string;
}

export interface SetNameTx extends BaseTx {
  readonly kind: TransactionKind.SET_NAME;
  readonly name: string;
}

export interface SwapOfferTx extends BaseTx {
  readonly kind: TransactionKind.SWAP_OFFER;
  readonly amount: ReadonlyArray<FungibleToken>;
  readonly recipient: RecipientId;
  readonly timeout: number; // number of blocks in the future
  readonly preimage: Uint8Array;
}

export interface SwapCounterTx extends BaseTx {
  readonly kind: TransactionKind.SWAP_COUNTER;
  readonly amount: ReadonlyArray<FungibleToken>;
  readonly recipient: RecipientId;
  readonly timeout: number; // number of blocks in the future
  readonly hashCode: Uint8Array; // pulled from the offer transaction
}

export interface SwapClaimTx extends BaseTx {
  readonly kind: TransactionKind.SWAP_CLAIM;
  readonly preimage: Uint8Array;
  readonly swapId: SwapIDBytes; // pulled from the offer transaction
}

export interface SwapTimeoutTx extends BaseTx {
  readonly kind: TransactionKind.SWAP_TIMEOUT;
  readonly swapId: SwapIDBytes; // pulled from the offer transaction
}

export type UnsignedTransaction =
  | SendTx
  | SetNameTx
  | SwapOfferTx
  | SwapCounterTx
  | SwapClaimTx
  | SwapTimeoutTx;
