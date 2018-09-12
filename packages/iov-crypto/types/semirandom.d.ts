export declare class SemiRandom {
    private seed;
    constructor(seed?: string);
    nextBytes(): Uint8Array;
    random(): number;
}
