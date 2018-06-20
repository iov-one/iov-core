import * as bip39 from "bip39";

import { Encoding } from "./encoding";

export class EnglishMnemonic {
  // list of space separated words (1 or more)
  private static readonly mnemonicMatcher = /^[a-z]+( [a-z]+)*$/;

  private readonly data: string;

  constructor(mnemonic: string) {
    if (!EnglishMnemonic.mnemonicMatcher.test(mnemonic)) {
      throw new Error("Invalid mnemonic format");
    }

    const wordCount = mnemonic.split(" ").length;
    if (wordCount !== 12 && wordCount !== 18 && wordCount !== 24) {
      throw new Error(`Invalid word count in mnemonic (allowed: 12, 18, 24 got: ${wordCount})`);
    }

    // Throws with informative error message if mnemonic is not valid
    // tslint:disable-next-line:no-unused-expression
    bip39.mnemonicToEntropy(mnemonic);

    this.data = mnemonic;
  }

  public asString(): string {
    return this.data;
  }
}

export class Bip39 {
  public static encode(entropy: Uint8Array): string {
    if (entropy.length !== 16 && entropy.length !== 24 && entropy.length !== 32) {
      throw new Error("invalid input length");
    }

    return bip39.entropyToMnemonic(Encoding.toHex(entropy));
  }

  public static decode(mnemonic: EnglishMnemonic): Uint8Array {
    return Encoding.fromHex(bip39.mnemonicToEntropy(mnemonic.asString()));
  }

  public static mnemonicToSeed(mnemonic: string, password?: string): Uint8Array {
    return new Uint8Array(bip39.mnemonicToSeed(mnemonic, password));
  }
}
