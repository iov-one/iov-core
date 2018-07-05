import { Slip0010RawIndex } from "@iov/crypto";

import { KeyringEntry, KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Ed25519HdKeyringEntry } from "./ed25519hd";

export class Ed25519SimpleAddressKeyringEntry extends Ed25519HdKeyringEntry implements KeyringEntry {
  // simple wrappers to cast return type
  public static fromEntropy(bip39Entropy: Uint8Array): Ed25519SimpleAddressKeyringEntry {
    return super.fromEntropy(bip39Entropy) as Ed25519SimpleAddressKeyringEntry;
  }

  public static fromMnemonic(mnemonicString: string): Ed25519SimpleAddressKeyringEntry {
    return super.fromMnemonic(mnemonicString) as Ed25519SimpleAddressKeyringEntry;
  }

  public readonly implementationId = "ed25519simpleaddress" as KeyringEntryImplementationIdString;

  public createIdentity(): Promise<LocalIdentity> {
    const nextIndex = super.getIdentities().length;
    const purpose = 4804438;
    const path: ReadonlyArray<Slip0010RawIndex> = [
      Slip0010RawIndex.hardened(purpose),
      Slip0010RawIndex.hardened(nextIndex),
    ];
    return super.createIdentity(path);
  }
}
