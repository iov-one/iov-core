export interface HeadTail {
    /** An array of start positions within the original data */
    readonly head: ReadonlyArray<number>;
    /** Arguments split by positions as defined by head */
    readonly tail: ReadonlyArray<Uint8Array>;
}
export declare class Abi {
    /**
     * Decode head-tail encoded data as described in
     * https://medium.com/@hayeah/how-to-decipher-a-smart-contract-method-call-8ee980311603
     */
    static decodeHeadTail(data: Uint8Array): HeadTail;
    static decodeVariableLength(data: Uint8Array): Uint8Array;
}
