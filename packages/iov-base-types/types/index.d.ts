import { As } from "type-tagger";
export declare enum Algorithm {
    Ed25519 = "ed25519",
    Secp256k1 = "secp256k1"
}
export declare type PublicKeyBytes = Uint8Array & As<"public-key">;
export interface PublicKeyBundle {
    readonly algo: Algorithm;
    readonly data: PublicKeyBytes;
}
/** Used to differentiate a blockchain. Should be alphanumeric or -_/ and unique */
export declare type ChainId = string & As<"chain-id">;
export declare type SignatureBytes = Uint8Array & As<"signature">;
export declare type PostableBytes = Uint8Array & As<"postable">;
export declare type TxId = Uint8Array & As<"txid">;
