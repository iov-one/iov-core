export interface Slip0010Result {
    readonly chainCode: Uint8Array;
    readonly privkey: Uint8Array;
}
export declare enum Slip0010Curve {
    Secp256k1 = "Bitcoin seed",
    Ed25519 = "ed25519 seed",
}
export declare class Slip0010 {
    static derivePath(curve: Slip0010Curve, seed: Uint8Array, path: ReadonlyArray<number>): Slip0010Result;
    static rawIndexFromHardened(hardenedIndex: number): number;
    static rawIndexFromNormal(normalIndex: number): number;
    private static master(curve, seed);
    private static child(curve, parentPrivkey, parentChainCode, rawIndex);
    private static childImpl(curve, parentPrivkey, parentChainCode, rawIndex, i);
    private static isZero(privkey);
    private static isGteN(curve, privkey);
    private static n(curve);
}
