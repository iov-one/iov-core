import { As } from "type-tagger";
import { ChainId, PublicKeyBundle } from "@iov/base-types";
import { Int53 } from "@iov/encoding";
import { Address } from "./signables";
export declare type Nonce = Int53 & As<"nonce">;
export declare type TtlBytes = Uint8Array & As<"ttl">;
export declare type TokenTicker = string & As<"token-ticker">;
export declare type SwapIdBytes = Uint8Array & As<"swap-id">;
export declare type SwapIdString = string & As<"swap-id">;
export interface Amount {
    /**
     * The quantity expressed as atomic units.
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
    readonly gasPrice?: Amount;
    readonly gasLimit?: Amount;
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
    readonly recipient: Address;
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
    readonly recipient: Address;
    /** absolute block height at which the offer times out */
    readonly timeout: number;
    readonly preimage: Uint8Array;
}
export interface SwapCounterTx extends BaseTx {
    readonly kind: TransactionKind.SwapCounter;
    readonly amount: ReadonlyArray<Amount>;
    readonly recipient: Address;
    /** absolute block height at which the counter offer times out */
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
export declare type UnsignedTransaction = AddAddressToUsernameTx | SendTx | SetNameTx | SwapOfferTx | SwapCounterTx | SwapClaimTx | SwapTimeoutTx | RegisterBlockchainTx | RegisterUsernameTx | RemoveAddressFromUsernameTx;
