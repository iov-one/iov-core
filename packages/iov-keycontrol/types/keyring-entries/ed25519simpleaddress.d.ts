import { KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Ed25519HdKeyringEntry } from "./ed25519hd";
export declare class Ed25519SimpleAddressKeyringEntry extends Ed25519HdKeyringEntry {
    static fromEntropy(bip39Entropy: Uint8Array): Ed25519SimpleAddressKeyringEntry;
    static fromMnemonic(mnemonicString: string): Ed25519SimpleAddressKeyringEntry;
    readonly implementationId: KeyringEntryImplementationIdString;
    createIdentity(): Promise<LocalIdentity>;
    clone(): Ed25519SimpleAddressKeyringEntry;
}
