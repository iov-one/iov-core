export declare class Secp256k1Signature {
    private readonly data;
    constructor(r: Uint8Array, s: Uint8Array);
    r(length?: number): Uint8Array;
    s(length?: number): Uint8Array;
    toDer(): Uint8Array;
}
/**
 * A Secp256k1Signature plus the recovery parameter
 */
export declare class ExtendedSecp256k1Signature extends Secp256k1Signature {
    readonly recovery: number;
    constructor(r: Uint8Array, s: Uint8Array, recovery: number);
}
