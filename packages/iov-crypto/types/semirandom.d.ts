export declare class SemiRandom {
    private seed;
    constructor(seed?: Uint8Array);
    nextBytes(): Uint8Array;
    random(): number;
}
