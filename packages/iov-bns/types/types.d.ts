import * as Long from "long";
import { As } from "type-tagger";
import { Address, Algorithm, ChainId, FullSignature, PublicKeyBundle, SendTransaction, SignatureBytes, SwapClaimTransaction, SwapOfferTransaction, SwapTimeoutTransaction, UnsignedTransaction } from "@iov/bcp";
import { Int53 } from "@iov/encoding";
import * as codecImpl from "./generated/codecimpl";
export interface ChainAddressPair {
    readonly chainId: ChainId;
    readonly address: Address;
}
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
export declare type BnsTx = SendTransaction | SwapOfferTransaction | SwapClaimTransaction | SwapTimeoutTransaction | AddAddressToUsernameTx | RegisterUsernameTx | RemoveAddressFromUsernameTx;
export declare function isBnsTx(transaction: UnsignedTransaction): transaction is BnsTx;
export declare function isAddAddressToUsernameTx(transaction: UnsignedTransaction): transaction is AddAddressToUsernameTx;
export declare function isRegisterUsernameTx(transaction: UnsignedTransaction): transaction is RegisterUsernameTx;
export declare function isRemoveAddressFromUsernameTx(transaction: UnsignedTransaction): transaction is RemoveAddressFromUsernameTx;
