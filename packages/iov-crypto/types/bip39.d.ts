export declare class Bip39 {
    static encode(entropy: Uint8Array): string;
    static decode(mnemonic: string): Uint8Array;
    static mnemonicToSeed(mnemonic: string, password?: string): Uint8Array;
    private static readonly mnemonicMatcher;
}
