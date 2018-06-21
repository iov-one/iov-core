export interface MasterResult {
    readonly chainCode: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare enum Slip0010Curves {
    Ed25519 = "ed25519 seed",
}
export declare class Slip0010 {
    static master(curve: Slip0010Curves, seed: Uint8Array): MasterResult;
}
