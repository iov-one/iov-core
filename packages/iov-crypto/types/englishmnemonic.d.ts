export declare class EnglishMnemonic {
  private static readonly mnemonicMatcher;
  private readonly data;
  constructor(mnemonic: string);
  toString(): string;
  /** @deprecated use toString */
  asString(): string;
}
