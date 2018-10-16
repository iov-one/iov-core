import { KeyringEntryImplementationIdString } from "../keyring";
import { Slip10Wallet } from "./slip10wallet";
export declare class Secp256k1HdWallet extends Slip10Wallet {
    static fromEntropy(bip39Entropy: Uint8Array): Secp256k1HdWallet;
    static fromMnemonic(mnemonicString: string): Secp256k1HdWallet;
    readonly implementationId: KeyringEntryImplementationIdString;
    clone(): Secp256k1HdWallet;
}
