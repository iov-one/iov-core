import { Uint32 } from "@iov/encoding";
export interface Slip0010Result {
    readonly chainCode: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare enum Slip0010Curve {
    Secp256k1 = "Bitcoin seed",
    Ed25519 = "ed25519 seed"
}
export declare class Slip0010RawIndex extends Uint32 {
    static hardened(hardenedIndex: number): Slip0010RawIndex;
    static normal(normalIndex: number): Slip0010RawIndex;
    isHardened(): boolean;
}
export declare class Slip0010 {
    static derivePath(curve: Slip0010Curve, seed: Uint8Array, path: ReadonlyArray<Slip0010RawIndex>): Slip0010Result;
    private static master;
    private static child;
    private static serializedPoint;
    private static childImpl;
    private static isZero;
    private static isGteN;
    private static n;
}
