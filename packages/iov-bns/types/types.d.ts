import * as Long from "long";
import { As } from "type-tagger";
import { Address, Algorithm, ChainId, FullSignature, PublicKeyBundle, SendTransaction, SignatureBytes, SwapAbortTransaction, SwapClaimTransaction, SwapOfferTransaction, TokenTicker, UnsignedTransaction } from "@iov/bcp";
import { Int53 } from "@iov/encoding";
import * as codecImpl from "./generated/codecimpl";
export interface ChainAddressPair {
    readonly chainId: ChainId;
    readonly address: Address;
}
export interface BnsBlockchainNft {
    readonly id: string;
    readonly owner: Address;
    /**
     * The registered chain information
     *
     * Fields as defined in https://github.com/iov-one/bns-spec/blob/master/docs/data/ObjectDefinitions.rst#chain
     */
    readonly chain: {
        readonly chainId: ChainId;
        readonly name: string;
        readonly enabled: boolean;
        readonly production: boolean;
        readonly networkId: string | undefined;
        readonly mainTickerId: TokenTicker | undefined;
    };
    readonly codecName: string;
    readonly codecConfig: string;
}
export interface BnsBlockchainsByChainIdQuery {
    readonly chainId: ChainId;
}
export declare type BnsBlockchainsQuery = BnsBlockchainsByChainIdQuery;
export declare function isBnsBlockchainsByChainIdQuery(query: BnsBlockchainsQuery): query is BnsBlockchainsByChainIdQuery;
export interface BnsUsernameNft {
    readonly id: string;
    readonly owner: Address;
    readonly addresses: ReadonlyArray<ChainAddressPair>;
}
export interface BnsUsernamesByUsernameQuery {
    readonly username: string;
}
export interface BnsUsernamesByOwnerAddressQuery {
    readonly owner: Address;
}
export interface BnsUsernamesByChainAndAddressQuery {
    readonly chain: ChainId;
    readonly address: Address;
}
export declare type BnsUsernamesQuery = BnsUsernamesByUsernameQuery | BnsUsernamesByOwnerAddressQuery | BnsUsernamesByChainAndAddressQuery;
export declare function isBnsUsernamesByUsernameQuery(query: BnsUsernamesQuery): query is BnsUsernamesByUsernameQuery;
export declare function isBnsUsernamesByOwnerAddressQuery(query: BnsUsernamesQuery): query is BnsUsernamesByOwnerAddressQuery;
export declare function isBnsUsernamesByChainAndAddressQuery(query: BnsUsernamesQuery): query is BnsUsernamesByChainAndAddressQuery;
export declare type PrivateKeyBytes = Uint8Array & As<"private-key">;
export interface PrivateKeyBundle {
    readonly algo: Algorithm;
    readonly data: PrivateKeyBytes;
}
export interface Result {
    readonly key: Uint8Array;
    readonly value: Uint8Array;
}
export interface Keyed {
    readonly _id: Uint8Array;
}
export interface Decoder<T extends {}> {
    readonly decode: (data: Uint8Array) => T;
}
export declare function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PublicKeyBundle;
export declare function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivateKeyBundle;
export declare function decodeSignature(signature: codecImpl.crypto.ISignature): SignatureBytes;
export declare const decodeFullSig: (sig: codecImpl.sigs.IStdSignature) => FullSignature;
export declare const asNumber: (maybeLong: number | Long | null | undefined) => number;
export declare function asInt53(input: Long | number | null | undefined): Int53;
export declare const ensure: <T>(maybe: T | null | undefined, msg?: string | undefined) => T;
export interface AddAddressToUsernameTx extends UnsignedTransaction {
    readonly kind: "bns/add_address_to_username";
    /** the username to be updated, must exist on chain */
    readonly username: string;
    readonly payload: ChainAddressPair;
}
export interface RegisterBlockchainTx extends UnsignedTransaction {
    readonly kind: "bns/register_blockchain";
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
export interface RegisterUsernameTx extends UnsignedTransaction {
    readonly kind: "bns/register_username";
    readonly username: string;
    readonly addresses: ReadonlyArray<ChainAddressPair>;
}
export interface RemoveAddressFromUsernameTx extends UnsignedTransaction {
    readonly kind: "bns/remove_address_from_username";
    /** the username to be updated, must exist on chain */
    readonly username: string;
    readonly payload: ChainAddressPair;
}
export declare type BnsTx = SendTransaction | SwapOfferTransaction | SwapClaimTransaction | SwapAbortTransaction | AddAddressToUsernameTx | RegisterBlockchainTx | RegisterUsernameTx | RemoveAddressFromUsernameTx;
export declare function isBnsTx(transaction: UnsignedTransaction): transaction is BnsTx;
export declare function isAddAddressToUsernameTx(transaction: UnsignedTransaction): transaction is AddAddressToUsernameTx;
export declare function isRegisterBlockchainTx(transaction: UnsignedTransaction): transaction is RegisterBlockchainTx;
export declare function isRegisterUsernameTx(transaction: UnsignedTransaction): transaction is RegisterUsernameTx;
export declare function isRemoveAddressFromUsernameTx(transaction: UnsignedTransaction): transaction is RemoveAddressFromUsernameTx;
