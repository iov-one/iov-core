import { Uint32 } from "@iov/encoding";
export interface Slip10Result {
    readonly chainCode: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare enum Slip10Curve {
    Secp256k1 = "Bitcoin seed",
    Ed25519 = "ed25519 seed"
}
export declare class Slip10RawIndex extends Uint32 {
    static hardened(hardenedIndex: number): Slip10RawIndex;
    static normal(normalIndex: number): Slip10RawIndex;
    isHardened(): boolean;
}
export declare class Slip0010 {
    static derivePath(curve: Slip10Curve, seed: Uint8Array, path: ReadonlyArray<Slip10RawIndex>): Slip10Result;
    private static master;
    private static child;
    private static serializedPoint;
    private static childImpl;
    private static isZero;
    private static isGteN;
    private static n;
}
