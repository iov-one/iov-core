export declare enum Slip0010Curves {
    Ed25519 = "ed25519 seed",
}
export declare class Slip0010 {
    static masterKey(curve: Slip0010Curves, seed: Uint8Array): Uint8Array;
}
