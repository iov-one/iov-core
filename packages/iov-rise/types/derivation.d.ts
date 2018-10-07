import { Ed25519Keypair } from "@iov/crypto";
export declare function passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair>;
export declare function pubkeyToAddress(pubkey: Uint8Array): Uint8Array;
