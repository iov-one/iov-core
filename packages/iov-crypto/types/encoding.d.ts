export declare class Encoding {
    static toHex(data: Uint8Array): string;
    static fromHex(hexstring: string): Uint8Array;
    static asAscii(input: string): Uint8Array;
}
