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
    static master(curve: Slip0010Curves, seed: Uint8Array): MasterResult;
    static childPrivkey(curve: Slip0010Curves, parentPrivkey: Uint8Array, parentChainCode: Uint8Array, index: BN): MasterResult;
    static derivePath(curve: Slip0010Curves, seed: Uint8Array, path: ReadonlyArray<BN>): MasterResult;
    static hardenedIndex(i: number): BN;
    static normalIndex(i: number): BN;
}
