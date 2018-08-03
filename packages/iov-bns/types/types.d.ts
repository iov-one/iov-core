import Long from "long";
import { FullSignature, FungibleToken } from "@iov/bcp-types";
import { Algorithm, PrivateKeyBundle, PrivateKeyBytes, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";
import * as codecImpl from "./codecimpl";
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
export declare const encodeToken: (token: FungibleToken) => codecImpl.x.Coin;
export declare const encodeFullSig: (sig: FullSignature) => codecImpl.sigs.StdSignature;
export declare const encodePubKey: (publicKey: PublicKeyBundle) => {
    ed25519: PublicKeyBytes;
};
export declare const encodePrivKey: (privateKey: PrivateKeyBundle) => {
    ed25519: PrivateKeyBytes;
};
export declare const encodeSignature: (algo: Algorithm, sigs: SignatureBytes) => {
    ed25519: SignatureBytes;
};
export declare const decodeToken: (token: codecImpl.x.ICoin) => FungibleToken;
export declare const decodePubKey: (publicKey: codecImpl.crypto.IPublicKey) => PublicKeyBundle;
export declare const decodePrivKey: (privateKey: codecImpl.crypto.IPrivateKey) => PrivateKeyBundle;
export declare const decodeSignature: (signature: codecImpl.crypto.ISignature) => SignatureBytes;
export declare const decodeFullSig: (sig: codecImpl.sigs.IStdSignature) => FullSignature;
export declare const asNumber: (maybeLong: number | Long | null | undefined) => number;
export declare const asLong: (maybeLong: number | Long | null | undefined) => Long;
export declare const ensure: <T>(maybe: T | null | undefined, msg?: string | undefined) => T;
