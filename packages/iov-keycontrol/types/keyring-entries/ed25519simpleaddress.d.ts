import { KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Slip10Wallet } from "./slip10";
export declare class Ed25519SimpleAddressKeyringEntry extends Slip10Wallet {
    static fromEntropy(bip39Entropy: Uint8Array): Ed25519SimpleAddressKeyringEntry;
    static fromMnemonic(mnemonicString: string): Ed25519SimpleAddressKeyringEntry;
    readonly implementationId: KeyringEntryImplementationIdString;
    createIdentity(): Promise<LocalIdentity>;
    clone(): Ed25519SimpleAddressKeyringEntry;
}
