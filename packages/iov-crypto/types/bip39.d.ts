export declare class EnglishMnemonic {
    private static readonly mnemonicMatcher;
    private readonly data;
    constructor(mnemonic: string);
    asString(): string;
}
export declare class Bip39 {
    static encode(entropy: Uint8Array): EnglishMnemonic;
    static decode(mnemonic: EnglishMnemonic): Uint8Array;
    static mnemonicToSeed(mnemonic: EnglishMnemonic, password?: string): Uint8Array;
}
