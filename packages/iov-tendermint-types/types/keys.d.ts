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
