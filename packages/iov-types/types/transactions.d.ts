import Long from "long";

import { As } from "./as";
import { AddressBytes, PublicKeyBundle } from "./keys";

export type Nonce = Long & As<"nonce">;

// TODO: can't we just make this a number (block height?)
export type TtlBytes = Uint8Array & As<"ttl">;

// TokenTicker should be 3-4 letters, uppercase
export type TokenTicker = string & As<"token-ticker">;

// ChainId is used to differentiate a blockchain
// should be alphanumeric or -_/ and unique
export type ChainId = string & As<"chain-id">;

export type SwapIdBytes = Uint8Array & As<"swap-id">;
export type SwapIdString = string & As<"swap-id">;

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
  readonly chainId: ChainId;
  readonly fee?: FungibleToken;
  // signer needs to be a PublicKey as we use that to as an identifier to the Keyring for lookup
  readonly signer: PublicKeyBundle;
  readonly ttl?: TtlBytes;
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
  readonly swapId: SwapIdBytes; // pulled from the offer transaction
}

export interface SwapTimeoutTx extends BaseTx {
  readonly kind: TransactionKind.SWAP_TIMEOUT;
  readonly swapId: SwapIdBytes; // pulled from the offer transaction
}

export type UnsignedTransaction =
  | SendTx
  | SetNameTx
  | SwapOfferTx
  | SwapCounterTx
  | SwapClaimTx
  | SwapTimeoutTx;
