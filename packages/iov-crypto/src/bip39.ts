import * as bip39 from "bip39";
import { pbkdf2 } from "pbkdf2";
import * as unorm from "unorm";

import { Encoding } from "./encoding";

export class EnglishMnemonic {
  // list of space separated lower case words (1 or more)
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
  public static encode(entropy: Uint8Array): EnglishMnemonic {
    if (entropy.length !== 16 && entropy.length !== 24 && entropy.length !== 32) {
      throw new Error("invalid input length");
    }

    return new EnglishMnemonic(bip39.entropyToMnemonic(Encoding.toHex(entropy)));
  }

  public static decode(mnemonic: EnglishMnemonic): Uint8Array {
    return Encoding.fromHex(bip39.mnemonicToEntropy(mnemonic.asString()));
  }

  public static mnemonicToSeed(mnemonic: EnglishMnemonic, password?: string): Promise<Uint8Array> {
    // reimplementation of bip39.mnemonicToSeed using the asynchonous
    // interface of https://www.npmjs.com/package/pbkdf2
    const mnemonicBytes = Buffer.from(unorm.nfkd(mnemonic.asString()), "utf8");
    const salt = "mnemonic" + (password ? unorm.nfkd(password) : "");
    const saltBytes = Buffer.from(salt, "utf8");
    return this.pbkdf2(mnemonicBytes, saltBytes, 2048, 64, "sha512");
  }

  // convert pbkdf2's calllback interface to Promise interface
  private static pbkdf2(
    secret: Uint8Array,
    salt: Uint8Array,
    iterations: number,
    keylen: number,
    digest: string,
  ): Promise<Uint8Array> {
    return new Promise<any>((resolve, reject) => {
      pbkdf2(secret, salt, iterations, keylen, digest, (err: any, derivedKey: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(new Uint8Array(derivedKey));
        }
      });
    });
  }
}
