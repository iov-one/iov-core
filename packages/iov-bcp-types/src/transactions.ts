import { As } from "type-tagger";

import { Int53 } from "@iov/encoding";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";

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
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: TokenTicker;
}

export enum TransactionKind {
  Send,
  /** @deprecated see SetNameTx */
  SetName,
  SwapOffer,
  SwapCounter,
  SwapClaim,
  SwapTimeout,
  RegisterBlockchain,
  RegisterUsername,
}

export interface BaseTx {
  /** the chain on which the transaction should be valid */
  readonly chainId: ChainId;
  readonly fee?: Amount;
  // signer needs to be a PublicKey as we use that to as an identifier to the Keyring for lookup
  readonly signer: PublicKeyBundle;
  readonly ttl?: TtlBytes;
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
  /** the ID of the blockchain to be registered */
  readonly blockchainId: ChainId;
}

export interface RegisterUsernameTx extends BaseTx {
  readonly kind: TransactionKind.RegisterUsername;
  readonly username: string;
  readonly addresses: Map<ChainId, Address>;
}

export type UnsignedTransaction =
  | SendTx
  | SetNameTx
  | SwapOfferTx
  | SwapCounterTx
  | SwapClaimTx
  | SwapTimeoutTx
  | RegisterBlockchainTx
  | RegisterUsernameTx;
