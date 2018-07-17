export declare class Uint32 {
    static fromBigEndianBytes(bytes: ArrayLike<number>): Uint32;
    protected readonly data: number;
    constructor(input: number);
    toBytesBigEndian(): ReadonlyArray<number>;
    asNumber(): number;
}
export declare class Int53 {
    static fromString(str: string): Int53;
    protected readonly data: number;
    constructor(input: number);
    asString(): string;
}
