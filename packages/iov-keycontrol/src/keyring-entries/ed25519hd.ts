import { Bip39, EnglishMnemonic } from "@iov/crypto";

import { KeyDataString } from "../keyring";

export class Ed25519HdKeyringEntry /* implements KeyringEntry */ {
  public static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdKeyringEntry {
    const mnemonic = Bip39.encode(bip39Entropy);
    const data = {
      secretIdentity: mnemonic.asString()
    };
    return new Ed25519HdKeyringEntry(JSON.stringify(data) as KeyDataString);
  }

  private readonly secretIdentity: EnglishMnemonic;

  constructor(data: KeyDataString) {
    this.secretIdentity = JSON.parse(data).secretIdentity;
  }

  public async serialize(): Promise<KeyDataString> {
    const data = {
      secretIdentity: this.secretIdentity.asString()
    };
    return JSON.stringify(data) as KeyDataString;
  }
}
