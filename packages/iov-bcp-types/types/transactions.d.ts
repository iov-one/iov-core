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
/** the primary identifier for a registered blockchain in the BNS */
export declare type BnsBlockchainId = Uint8Array & As<"blockchain-nft-id">;
export interface ChainAddressPair {
    readonly blockchainId: BnsBlockchainId;
    readonly address: Address;
}
export declare enum TransactionKind {
    AddAddressToUsername = 0,
    Send = 1,
    /** @deprecated see SetNameTx */
    SetName = 2,
    SwapOffer = 3,
    SwapCounter = 4,
    SwapClaim = 5,
    SwapTimeout = 6,
    RegisterBlockchain = 7,
    RegisterUsername = 8,
    RemoveAddressFromUsername = 9
}
export interface BaseTx {
    /** the chain on which the transaction should be valid */
    readonly chainId: ChainId;
    readonly fee?: Amount;
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
export interface RegisterBlockchainTx extends BaseTx {
    readonly kind: TransactionKind.RegisterBlockchain;
    /** the ID of the blockchain to be registered */
    readonly blockchainId: BnsBlockchainId;
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
export declare type UnsignedTransaction = AddAddressToUsernameTx | SendTx | SetNameTx | SwapOfferTx | SwapCounterTx | SwapClaimTx | SwapTimeoutTx | RegisterBlockchainTx | RegisterUsernameTx | RemoveAddressFromUsernameTx;
