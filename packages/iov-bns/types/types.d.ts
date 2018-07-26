import Long from "long";
import { FullSignature, FungibleToken } from "@iov/bcp-types";
import { Algorithm, PrivateKeyBundle, PrivateKeyBytes, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";
import * as codec from "./codec";
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
export declare const encodeToken: (token: FungibleToken) => codec.x.Coin;
export declare const encodeFullSig: (sig: FullSignature) => codec.sigs.StdSignature;
export declare const encodePubKey: (publicKey: PublicKeyBundle) => {
    ed25519: PublicKeyBytes;
};
export declare const encodePrivKey: (privateKey: PrivateKeyBundle) => {
    ed25519: PrivateKeyBytes;
};
export declare const encodeSignature: (algo: Algorithm, sigs: SignatureBytes) => {
    ed25519: SignatureBytes;
};
export declare const decodeToken: (token: codec.x.ICoin) => FungibleToken;
export declare const decodePubKey: (publicKey: codec.crypto.IPublicKey) => PublicKeyBundle;
export declare const decodePrivKey: (privateKey: codec.crypto.IPrivateKey) => PrivateKeyBundle;
export declare const decodeSignature: (signature: codec.crypto.ISignature) => SignatureBytes;
export declare const decodeFullSig: (sig: codec.sigs.IStdSignature) => FullSignature;
export declare const asNumber: (maybeLong: number | Long | null | undefined) => number;
export declare const asLong: (maybeLong: number | Long | null | undefined) => Long;
export declare const ensure: <T>(maybe: T | null | undefined, msg?: string | undefined) => T;
