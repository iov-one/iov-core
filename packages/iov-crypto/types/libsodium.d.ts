export declare class Random {
    static getBytes(count: number): Promise<Uint8Array>;
}
export declare const Ed25519KeypairSymbol: unique symbol;
export declare type Ed25519Keypair = typeof Ed25519KeypairSymbol & {
    readonly pubkey: Uint8Array;
    readonly privkey: Uint8Array;
};
export declare class Ed25519 {
    static generateKeypair(seed: Uint8Array): Promise<Ed25519Keypair>;
    static createSignature(message: Uint8Array, privkey: Uint8Array): Promise<Uint8Array>;
    static verifySignature(signature: Uint8Array, message: Uint8Array, pubkey: Uint8Array): Promise<boolean>;
}
export declare class Chacha20poly1305Ietf {
    static encrypt(message: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
    static decrypt(ciphertext: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
}
