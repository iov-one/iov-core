import { Ed25519, Ed25519Keypair, Sha256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";

export async function passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair> {
  const encodedPassphrase = Encoding.toUtf8(passphrase);
  const hash = new Sha256(encodedPassphrase).digest();
  const keypair = await Ed25519.makeKeypair(hash);
  return keypair;
}
