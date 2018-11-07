import * as Long from "long";
import { BcpCoin, FullSignature, FungibleToken } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";
import { Algorithm, PrivateKeyBundle, PublicKeyBundle, SignatureBytes } from "@iov/tendermint-types";
import * as codecImpl from "./codecimpl";
import { InitData } from "./normalize";
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
export declare const encodeFullSig: (sig: FullSignature) => codecImpl.sigs.StdSignature;
export declare const encodeSignature: (algo: Algorithm, sigs: SignatureBytes) => {
    ed25519: SignatureBytes;
};
export declare const decodeToken: (token: codecImpl.x.ICoin) => FungibleToken;
export declare const fungibleToBcpCoin: (initData: InitData) => (token: FungibleToken) => BcpCoin;
export declare function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PublicKeyBundle;
export declare function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivateKeyBundle;
export declare const decodeSignature: (signature: codecImpl.crypto.ISignature) => SignatureBytes;
export declare const decodeFullSig: (sig: codecImpl.sigs.IStdSignature) => FullSignature;
export declare const asNumber: (maybeLong: number | Long | null | undefined) => number;
export declare function asInt53(input: Long | number | null | undefined): Int53;
export declare const ensure: <T>(maybe: T | null | undefined, msg?: string | undefined) => T;
