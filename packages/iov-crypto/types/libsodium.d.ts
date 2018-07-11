declare class As<Tag extends string> {
    private readonly "_ _ _";
}
export declare type Chacha20poly1305IetfKey = Uint8Array & As<"chacha20poly1305ietf-key">;
export declare type Chacha20poly1305IetfMessage = Uint8Array & As<"chacha20poly1305ietf-message">;
export declare type Chacha20poly1305IetfNonce = Uint8Array & As<"chacha20poly1305ietf-nonce">;
export declare type Chacha20poly1305IetfCiphertext = Uint8Array & As<"chacha20poly1305ietf-ciphertext">;
export declare class Random {
    static getBytes(count: number): Promise<Uint8Array>;
}
export declare class Ed25519Keypair {
    readonly privkey: Uint8Array;
    readonly pubkey: Uint8Array;
    static fromLibsodiumPrivkey(libsodiumPrivkey: Uint8Array): Ed25519Keypair;
    constructor(privkey: Uint8Array, pubkey: Uint8Array);
    toLibsodiumPrivkey(): Uint8Array;
}
export declare class Ed25519 {
    static makeKeypair(seed: Uint8Array): Promise<Ed25519Keypair>;
    static createSignature(message: Uint8Array, keyPair: Ed25519Keypair): Promise<Uint8Array>;
    static verifySignature(signature: Uint8Array, message: Uint8Array, pubkey: Uint8Array): Promise<boolean>;
}
export declare class Chacha20poly1305Ietf {
    static encrypt(message: Chacha20poly1305IetfMessage, key: Chacha20poly1305IetfKey, nonce: Chacha20poly1305IetfNonce): Promise<Chacha20poly1305IetfCiphertext>;
    static decrypt(ciphertext: Chacha20poly1305IetfCiphertext, key: Chacha20poly1305IetfKey, nonce: Chacha20poly1305IetfNonce): Promise<Chacha20poly1305IetfMessage>;
}
export {};
