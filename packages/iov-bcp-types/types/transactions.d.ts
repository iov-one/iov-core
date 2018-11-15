import { As } from "type-tagger";
import { ChainId, PublicKeyBundle } from "@iov/base-types";
import { Int53 } from "@iov/encoding";
import { Address } from "./signables";
export declare type Nonce = Int53 & As<"nonce">;
export declare type TtlBytes = Uint8Array & As<"ttl">;
export declare type TokenTicker = string & As<"token-ticker">;
export declare type SwapIdBytes = Uint8Array & As<"swap-id">;
export declare type SwapIdString = string & As<"swap-id">;
export declare type RecipientId = Address;
export interface Amount {
    readonly whole: number;
    readonly fractional: number;
    readonly tokenTicker: TokenTicker;
}
export declare enum TransactionKind {
    Send = 0,
    /** @deprecated see SetNameTx */
    SetName = 1,
    SwapOffer = 2,
    SwapCounter = 3,
    SwapClaim = 4,
    SwapTimeout = 5,
    RegisterUsername = 6
}
export interface BaseTx {
    readonly chainId: ChainId;
    readonly fee?: Amount;
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
    readonly timeout: number;
    readonly preimage: Uint8Array;
}
export interface SwapCounterTx extends BaseTx {
    readonly kind: TransactionKind.SwapCounter;
    readonly amount: ReadonlyArray<Amount>;
    readonly recipient: RecipientId;
    readonly timeout: number;
    readonly hashCode: Uint8Array;
    readonly memo?: string;
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
export interface RegisterUsernameTx extends BaseTx {
    readonly kind: TransactionKind.RegisterUsername;
    readonly username: string;
    readonly addresses: Map<ChainId, Address>;
}
export declare type UnsignedTransaction = SendTx | SetNameTx | SwapOfferTx | SwapCounterTx | SwapClaimTx | SwapTimeoutTx | RegisterUsernameTx;
