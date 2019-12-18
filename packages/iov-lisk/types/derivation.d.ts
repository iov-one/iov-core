import { Address, PubkeyBundle } from "@iov/bcp";
import { Ed25519Keypair } from "@iov/crypto";
export declare class Derivation {
  static isValidAddress(address: string): boolean;
  static pubkeyToAddress(pubkey: PubkeyBundle): Address;
  static passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair>;
}
