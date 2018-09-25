export declare class Uint32 {
    static fromBigEndianBytes(bytes: ArrayLike<number>): Uint32;
    protected readonly data: number;
    constructor(input: number);
    toBytesBigEndian(): ReadonlyArray<number>;
    asNumber(): number;
}
export interface Uint64Components {
    readonly high: Uint32;
    readonly low: Uint32;
}
export declare class Uint64 {
    static fromBigEndianBytes(bytes: ArrayLike<number>): Uint64;
    protected readonly high: Uint32;
    protected readonly low: Uint32;
    constructor(input: number | Uint64Components);
    toBytesBigEndian(): ReadonlyArray<number>;
    asNumber(): number;
    toString(): string;
}
export declare class Int53 {
    static fromString(str: string): Int53;
    protected readonly data: number;
    constructor(input: number);
    asNumber(): number;
    asString(): string;
}
