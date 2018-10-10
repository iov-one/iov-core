import Long from "long";

import { Ed25519, Ed25519Keypair, Sha256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

export async function passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair> {
  const encodedPassphrase = Encoding.toUtf8(passphrase);
  const hash = new Sha256(encodedPassphrase).digest();
  const keypair = await Ed25519.makeKeypair(hash);
  return keypair;
}

export function pubkeyToAddress(pubkey: Uint8Array): Uint8Array {
  // https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/lisk.cpp#L26
  const hash = new Sha256(pubkey).digest();
  const firstEightBytes = Array.from(hash.slice(0, 8));
  const addressString = Long.fromBytesLE(firstEightBytes, true).toString(10) + "R";
  return Encoding.toAscii(addressString);
}
