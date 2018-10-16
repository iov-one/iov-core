import { KeyringEntryImplementationIdString } from "../keyring";
import { Slip10Wallet } from "./slip10wallet";
export declare class Ed25519HdWallet extends Slip10Wallet {
    static fromEntropy(bip39Entropy: Uint8Array): Ed25519HdWallet;
    static fromMnemonic(mnemonicString: string): Ed25519HdWallet;
    readonly implementationId: KeyringEntryImplementationIdString;
    clone(): Ed25519HdWallet;
}
