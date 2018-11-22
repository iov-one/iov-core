import { ExtendedSecp256k1Signature, Secp256k1Signature } from "./secp256k1signature";
export declare const Secp256k1KeypairSymbol: unique symbol;
export declare type Secp256k1Keypair = typeof Secp256k1KeypairSymbol & {
    readonly pubkey: Uint8Array;
    readonly privkey: Uint8Array;
};
export declare class Secp256k1 {
    static makeKeypair(privkey: Uint8Array): Promise<Secp256k1Keypair>;
    static createSignature(messageHash: Uint8Array, privkey: Uint8Array): Promise<ExtendedSecp256k1Signature>;
    static verifySignature(signature: Secp256k1Signature, messageHash: Uint8Array, pubkey: Uint8Array): Promise<boolean>;
}
