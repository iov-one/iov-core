import { Address } from "@iov/bcp";
import { Ed25519Keypair } from "@iov/crypto";
export declare class Derivation {
  static isValidAddressWithEnding(address: string, ending: string): boolean;
  static passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair>;
  static pubkeyToAddress(pubkey: Uint8Array, suffix: string): Address;
}
