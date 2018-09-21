import { HashFunction } from "./sha";
export declare class Ripemd160 implements HashFunction {
    readonly blockSize: number;
    private readonly impl;
    constructor(firstData?: Uint8Array);
    update(data: Uint8Array): Ripemd160;
    digest(): Uint8Array;
}
