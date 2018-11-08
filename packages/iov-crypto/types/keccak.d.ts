import { Address } from "@iov/bcp-types";
import { HashFunction } from "./sha";
export declare class Keccak256 implements HashFunction {
    readonly blockSize: number;
    private readonly impl;
    constructor(firstData?: Uint8Array | Address);
    update(data: Uint8Array | Address): Keccak256;
    digest(): Uint8Array;
}
