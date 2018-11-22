export declare class Secp256k1Signature {
    private readonly data;
    constructor(r: Uint8Array, s: Uint8Array, recovery: number);
    r(length?: number): Uint8Array;
    s(length?: number): Uint8Array;
    toDer(): Uint8Array;
}
