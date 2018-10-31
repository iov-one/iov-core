import { Ed25519Keypair } from "@iov/crypto";
export declare class Derivation {
    static isValidAddressWithEnding(address: string, ending: string): boolean;
    static passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair>;
}
