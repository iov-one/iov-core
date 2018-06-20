import * as bip39 from "bip39";

import { Encoding } from "./encoding";

export class Bip39 {
  public static encode(entropy: Uint8Array): string {
    if (entropy.length !== 16 && entropy.length !== 24 && entropy.length !== 32) {
      throw new Error("invalid input length");
    }

    return bip39.entropyToMnemonic(Encoding.toHex(entropy));
  }
}
