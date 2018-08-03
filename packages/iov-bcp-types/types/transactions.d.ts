import Long from "long";
import { As } from "type-tagger";
import { ChainId, PublicKeyBundle } from "@iov/tendermint-types";
import { Address } from "./signables";
export declare type Nonce = Long & As<"nonce">;
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
    SEND = 0,
    SET_NAME = 1,
    SWAP_OFFER = 2,
    SWAP_COUNTER = 3,
    SWAP_CLAIM = 4,
    SWAP_TIMEOUT = 5
}
export interface BaseTx {
    readonly chainId: ChainId;
    readonly fee?: FungibleToken;
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
    readonly timeout: number;
    readonly preimage: Uint8Array;
}
export interface SwapCounterTx extends BaseTx {
    readonly kind: TransactionKind.SWAP_COUNTER;
    readonly amount: ReadonlyArray<FungibleToken>;
    readonly recipient: RecipientId;
    readonly timeout: number;
    readonly hashCode: Uint8Array;
}
export interface SwapClaimTx extends BaseTx {
    readonly kind: TransactionKind.SWAP_CLAIM;
    readonly preimage: Uint8Array;
    readonly swapId: SwapIdBytes;
}
export interface SwapTimeoutTx extends BaseTx {
    readonly kind: TransactionKind.SWAP_TIMEOUT;
    readonly swapId: SwapIdBytes;
}
export declare type UnsignedTransaction = SendTx | SetNameTx | SwapOfferTx | SwapCounterTx | SwapClaimTx | SwapTimeoutTx;
