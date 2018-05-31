import { PublicKey, AddressString } from "./keys";

declare const NonceSymbol: unique symbol;
export type Nonce = typeof NonceSymbol & number;

// TODO: can't we just make this a number (block height?)
declare const TTLSymbol: unique symbol;
type TTL = typeof TTLSymbol;
export type TTLBuffer = TTL & Uint8Array;
export type TTLString = TTL & string;

// CurrencyCode should be 3-4 letters, uppercase
declare const CurrencySymbol: unique symbol;
export type CurrencyCode = typeof CurrencySymbol & string;

// ChainID should be 3-4 letters, uppercase
declare const ChainSymbol: unique symbol;
export type ChainID = typeof ChainSymbol & string;

declare const SwapIDSymbol: unique symbol;
type SwapID = typeof SwapIDSymbol;
export type SwapIDBuffer = SwapID & Uint8Array;
export type SwapIDString = SwapID & string;

export interface Coin {
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: CurrencyCode;
}

export interface BaseTx {
  readonly chainId: ChainID;
  readonly fee: Coin;
  readonly signer: PublicKey;
  readonly ttl?: TTLString;
}

export interface SendTx extends BaseTx {
  readonly kind: "send";
  readonly amount: Coin;
  readonly recipient: PublicKey;
}

export interface SetNameTx extends BaseTx {
  readonly kind: "set_name";
  readonly name: string;
}

export interface SwapOfferTx extends BaseTx {
  readonly kind: "swap_offer";
  readonly amount: ReadonlyArray<Coin>;
  readonly recipient: PublicKey;
  readonly timeout: number; // number of blocks in the future
  readonly preimage: Uint8Array;
}

export interface SwapCounterTx extends BaseTx {
  readonly kind: "swap_counter";
  readonly amount: ReadonlyArray<Coin>;
  readonly recipient: PublicKey;
  readonly timeout: number; // number of blocks in the future
  readonly hash: Uint8Array;
}

export interface SwapClaimTx extends BaseTx {
  readonly kind: "swap_claim";
  readonly preimage: Uint8Array;
  readonly swapId: SwapIDString;
}

export interface SwapTimeoutTx extends BaseTx {
  readonly kind: "swap_timeout";
  readonly swapId: SwapIDString;
}

export type Transaction =
  | SendTx
  | SetNameTx
  | SwapOfferTx
  | SwapCounterTx
  | SwapClaimTx
  | SwapTimeoutTx;
