import { KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Slip10KeyringEntry } from "./ed25519hd";
export declare class Ed25519SimpleAddressKeyringEntry extends Slip10KeyringEntry {
    static fromEntropy(bip39Entropy: Uint8Array): Ed25519SimpleAddressKeyringEntry;
    static fromMnemonic(mnemonicString: string): Ed25519SimpleAddressKeyringEntry;
    readonly implementationId: KeyringEntryImplementationIdString;
    createIdentity(): Promise<LocalIdentity>;
    clone(): Ed25519SimpleAddressKeyringEntry;
}
