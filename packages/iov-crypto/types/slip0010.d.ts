/// <reference types="bn.js" />
import BN = require("bn.js");
export interface Slip0010Result {
    readonly chainCode: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare enum Slip0010Curve {
    Secp256k1 = "Bitcoin seed",
    Ed25519 = "ed25519 seed",
}
export declare class Slip0010 {
    static derivePath(curve: Slip0010Curve, seed: Uint8Array, path: ReadonlyArray<BN>): Slip0010Result;
    static hardenedIndex(i: number): BN;
    static normalIndex(i: number): BN;
    private static master(curve, seed);
    private static child(curve, parentPrivkey, parentChainCode, index);
    private static childImpl(curve, parentPrivkey, parentChainCode, index, i);
    private static isZero(privkey);
    private static isGteN(curve, privkey);
    private static n(curve);
}
