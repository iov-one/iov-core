import { As } from "type-tagger";
import { Int53 } from "@iov/encoding";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";
import { Address } from "./signables";
export declare type Nonce = Int53 & As<"nonce">;
export declare type TtlBytes = Uint8Array & As<"ttl">;
export declare type TokenTicker = string & As<"token-ticker">;
export declare type SwapIdBytes = Uint8Array & As<"swap-id">;
export declare type SwapIdString = string & As<"swap-id">;
export declare type RecipientId = Address;
export interface FungibleToken {
    readonly whole: number;
    readonly fractional: number;
    readonly tokenTicker: TokenTicker;
}
export declare enum TransactionKind {
    Send = 0,
    SetName = 1,
    SwapOffer = 2,
    SwapCounter = 3,
    SwapClaim = 4,
    SwapTimeout = 5
}
export interface BaseTx {
    readonly chainId: ChainId;
    readonly fee?: FungibleToken;
    readonly signer: PublicKeyBundle;
    readonly ttl?: TtlBytes;
}
export interface SendTx extends BaseTx {
    readonly kind: TransactionKind.Send;
    readonly amount: FungibleToken;
    readonly recipient: RecipientId;
    readonly memo?: string;
}
export interface SetNameTx extends BaseTx {
    readonly kind: TransactionKind.SetName;
    readonly name: string;
}
export interface SwapOfferTx extends BaseTx {
    readonly kind: TransactionKind.SwapOffer;
    readonly amount: ReadonlyArray<FungibleToken>;
    readonly recipient: RecipientId;
    readonly timeout: number;
    readonly preimage: Uint8Array;
}
export interface SwapCounterTx extends BaseTx {
    readonly kind: TransactionKind.SwapCounter;
    readonly amount: ReadonlyArray<FungibleToken>;
    readonly recipient: RecipientId;
    readonly timeout: number;
    readonly hashCode: Uint8Array;
}
export interface SwapClaimTx extends BaseTx {
    readonly kind: TransactionKind.SwapClaim;
    readonly preimage: Uint8Array;
    readonly swapId: SwapIdBytes;
}
export interface SwapTimeoutTx extends BaseTx {
    readonly kind: TransactionKind.SwapTimeout;
    readonly swapId: SwapIdBytes;
}
export declare type UnsignedTransaction = SendTx | SetNameTx | SwapOfferTx | SwapCounterTx | SwapClaimTx | SwapTimeoutTx;
