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
    asNumber(): number;
    asString(): string;
}
export declare class Uint64 {
    static fromBytesBigEndian(bytes: ArrayLike<number>): Uint64;
    static fromString(str: string): Uint64;
    private readonly data;
    private constructor();
    toBytesBigEndian(): ReadonlyArray<number>;
    toBytesLittleEndian(): ReadonlyArray<number>;
    toString(): string;
    toNumber(): number;
}
