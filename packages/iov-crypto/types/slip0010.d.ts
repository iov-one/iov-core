/// <reference types="bn.js" />
import BN = require("bn.js");
export interface MasterResult {
    readonly chainCode: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare enum Slip0010Curves {
    Ed25519 = "ed25519 seed",
}
export declare class Slip0010 {
    static derivePath(curve: Slip0010Curves, seed: Uint8Array, path: ReadonlyArray<BN>): MasterResult;
    static hardenedIndex(i: number): BN;
    static normalIndex(i: number): BN;
    private static master(curve, seed);
    private static childPrivkey(curve, parentPrivkey, parentChainCode, index);
}
