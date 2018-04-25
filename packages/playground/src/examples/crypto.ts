// import shajs from 'sha.js';
import {
  instantiate,
  Nacl,
  NaclCallback,
  NaclOpts,
  SignerPublicKey,
  SignerSecretKey
} from "js-nacl";

type SignatureBuffer = Uint8Array;
type Message = Uint8Array;

interface IKeyPair {
  readonly pubkey: SignerPublicKey;
  readonly secret: SignerSecretKey;
  //   readonly nonce: IReadonlyDictionary<number>;
}

// interface IReadonlyDictionary<T> {
//   readonly [key: string]: T;
// }

// init must be called and the promise resolved before any other functions are called
export function initNacl(opts: NaclOpts): Promise<Nacl> {
  return new Promise((res: NaclCallback, _: any) => {
    const setup = (nacl: Nacl) => res(nacl);
    // tslint:disable-next-line:no-expression-statement
    instantiate(setup, opts);
  });
}

export function getAddress(nacl: Nacl, pubkey: SignerPublicKey): string {
  // this is a prefix for all pubkey signatures
  const id = getIdentifier(pubkey);
  return nacl.to_hex(nacl.crypto_hash_sha256(id)).slice(0, 40); // 20 bytes
}

// ugh, how to get this to compile????
export function getIdentifier(pubkey: SignerPublicKey): Uint8Array {
  const prefix = Buffer.from("sigs/ed25519/");
  return new Uint8Array([...prefix, ...pubkey]);
}

// generateKeyPair creates a private/public key pair
export function generateKeyPair(nacl: Nacl): IKeyPair {
  const keypair: any = nacl.crypto_sign_keypair();
  return {
    // nonce: {},
    pubkey: keypair.signPk,
    secret: keypair.signSk
  };
}

export function sign(
  nacl: Nacl,
  msg: Message,
  secret: SignerSecretKey
): SignatureBuffer {
  return nacl.crypto_sign_detached(msg, secret);
}

export function verify(
  nacl: Nacl,
  msg: Message,
  sig: SignatureBuffer,
  pubkey: SignerPublicKey
): boolean {
  return nacl.crypto_sign_verify_detached(sig, msg, pubkey);
}
