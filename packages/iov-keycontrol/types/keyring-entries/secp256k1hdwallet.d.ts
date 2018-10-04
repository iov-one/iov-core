import { Slip10RawIndex } from "@iov/crypto";
import { KeyringEntryImplementationIdString, LocalIdentity } from "../keyring";
import { Slip10KeyringEntry } from "./slip10";
export declare class Secp256k1HdWallet extends Slip10KeyringEntry {
    static fromEntropy(bip39Entropy: Uint8Array): Secp256k1HdWallet;
    static fromMnemonic(mnemonicString: string): Secp256k1HdWallet;
    readonly implementationId: KeyringEntryImplementationIdString;
    createIdentity(path?: ReadonlyArray<Slip10RawIndex>): Promise<LocalIdentity>;
    clone(): Secp256k1HdWallet;
}
