import { KeyringEntrySerializationString, LocalIdentity } from "../keyring";
import { Slip10KeyringEntry } from "./slip10";
export declare class Ed25519SimpleAddressKeyringEntry extends Slip10KeyringEntry {
    static fromEntropy(bip39Entropy: Uint8Array): Ed25519SimpleAddressKeyringEntry;
    static fromMnemonic(mnemonicString: string): Ed25519SimpleAddressKeyringEntry;
    constructor(data: KeyringEntrySerializationString);
    createIdentity(): Promise<LocalIdentity>;
    clone(): Ed25519SimpleAddressKeyringEntry;
}
