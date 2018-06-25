import { Bip39, EnglishMnemonic } from "@iov/crypto";

import { KeyDataString } from "../keyring";

export class Ed25519HdKeyringEntry /* implements KeyringEntry */ {
  public static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdKeyringEntry {
    const mnemonic = Bip39.encode(bip39Entropy);
    const data = {
      secret: mnemonic.asString(),
    };
    return new Ed25519HdKeyringEntry(JSON.stringify(data) as KeyDataString);
  }

  private readonly secret: EnglishMnemonic;

  constructor(data: KeyDataString) {
    this.secret = JSON.parse(data).secret;
  }

  public async serialize(): Promise<KeyDataString> {
    const data = {
      secret: this.secret.asString(),
    };
    return JSON.stringify(data) as KeyDataString;
  }
}
