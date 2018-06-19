export interface Secp256k1Keypair {
    readonly pubkey: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare class Secp256k1 {
    static makeKeypair(privkey: Uint8Array): Promise<Secp256k1Keypair>;
    static createSignature(message: Uint8Array, privkey: Uint8Array): Promise<Uint8Array>;
    static verifySignature(signature: Uint8Array, message: Uint8Array, pubkey: Uint8Array): Promise<boolean>;
}
