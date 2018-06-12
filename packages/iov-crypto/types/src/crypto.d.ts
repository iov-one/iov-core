export declare class Encoding {
    static toHex(data: Uint8Array): string;
    static fromHex(hexstring: string): Uint8Array;
}
export interface Keypair {
    readonly pubkey: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare class Ed25519 {
    static generateKeypair(): Promise<Keypair>;
    static createSignature(message: Uint8Array, privkey: Uint8Array): Promise<Uint8Array>;
    static verifySignature(signature: Uint8Array, message: Uint8Array, pubkey: Uint8Array): Promise<boolean>;
}
export declare class Sha256 {
    static digest(data: Uint8Array): Promise<Uint8Array>;
}
export declare class Chacha20poly1305Ietf {
    static encrypt(message: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
    static decrypt(ciphertext: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<Uint8Array>;
}
