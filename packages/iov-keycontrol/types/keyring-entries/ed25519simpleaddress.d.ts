import { KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Slip10Wallet } from "./slip10wallet";
export declare class Ed25519SimpleAddressKeyringEntry extends Slip10Wallet {
    static fromEntropy(bip39Entropy: Uint8Array): Ed25519SimpleAddressKeyringEntry;
    static fromMnemonic(mnemonicString: string): Ed25519SimpleAddressKeyringEntry;
    readonly implementationId: KeyringEntryImplementationIdString;
    /**
     * Creates a simple address identity
     *
     * @param index an index i >= 0 as defined in https://github.com/iov-one/iov-core/blob/master/docs/KeyBase.md#simple-address-derivation
     */
    createIdentity(index: number): Promise<LocalIdentity>;
    clone(): Ed25519SimpleAddressKeyringEntry;
}
