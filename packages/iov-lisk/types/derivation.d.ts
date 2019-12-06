import { Address } from "@iov/bcp";
import { Ed25519Keypair } from "@iov/crypto";
export declare class Derivation {
  static isValidAddress(address: string): boolean;
  static pubkeyToAddress(pubkey: Uint8Array): Address;
  static passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair>;
}
