import { PublicKeyBundle } from "./keys";
import Long from "long";

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

// ChainID should be 3-4 letters, uppercase
declare const ChainSymbol: unique symbol;
export type ChainID = typeof ChainSymbol & string;

declare const SwapIDSymbol: unique symbol;
type SwapID = typeof SwapIDSymbol;
export type SwapIDBytes = SwapID & Uint8Array;
export type SwapIDString = SwapID & string;

export interface FungibleToken {
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: TokenTicker;
}

export interface BaseTx {
  readonly chainId: ChainID;
  readonly fee: FungibleToken;
  readonly signer: PublicKeyBundle;
  readonly ttl?: TTLBytes;
}

export interface SendTx extends BaseTx {
  readonly kind: "send";
  readonly amount: FungibleToken;
  readonly recipient: PublicKeyBundle;
}

export interface SetNameTx extends BaseTx {
  readonly kind: "set_name";
  readonly name: string;
}

export interface SwapOfferTx extends BaseTx {
  readonly kind: "swap_offer";
  readonly amount: ReadonlyArray<FungibleToken>;
  readonly recipient: PublicKeyBundle;
  readonly timeout: number; // number of blocks in the future
  readonly preimage: Uint8Array;
}

export interface SwapCounterTx extends BaseTx {
  readonly kind: "swap_counter";
  readonly amount: ReadonlyArray<FungibleToken>;
  readonly recipient: PublicKeyBundle;
  readonly timeout: number; // number of blocks in the future
  readonly hash: Uint8Array;
}

export interface SwapClaimTx extends BaseTx {
  readonly kind: "swap_claim";
  readonly preimage: Uint8Array;
  readonly swapId: SwapIDBytes;
}

export interface SwapTimeoutTx extends BaseTx {
  readonly kind: "swap_timeout";
  readonly swapId: SwapIDBytes;
}

export type Transaction =
  | SendTx
  | SetNameTx
  | SwapOfferTx
  | SwapCounterTx
  | SwapClaimTx
  | SwapTimeoutTx;
