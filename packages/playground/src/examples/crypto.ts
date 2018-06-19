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

// ugh, how to get this to compile????
export const getIdentifier = (pubkey: SignerPublicKey): Uint8Array => {
  const prefix = Buffer.from("sigs/ed25519/");
  return new Uint8Array([...prefix, ...pubkey]);
};

// init must be called and the promise resolved before any other functions are called
export const initNacl = (opts: NaclOpts): Promise<Nacl> =>
  new Promise((res: NaclCallback): void => {
    const setup = (nacl: Nacl) => res(nacl);
    return instantiate(setup, opts);
  });

export const getAddress = (nacl: Nacl) => (pubkey: SignerPublicKey): string => {
  // this is a prefix for all pubkey signatures
  const id = getIdentifier(pubkey);
  const hash = nacl.crypto_hash_sha256(id);
  return nacl.to_hex(hash).slice(0, 40); // 20 bytes
};

// generateKeyPair creates a private/public key pair
export const generateKeyPair = (nacl: Nacl) => (): IKeyPair => {
  const keypair: any = nacl.crypto_sign_keypair();
  return {
    // nonce: {},
    pubkey: keypair.signPk,
    secret: keypair.signSk
  };
};

export const sign = (nacl: Nacl) => (
  msg: Message,
  secret: SignerSecretKey
): SignatureBuffer => nacl.crypto_sign_detached(msg, secret);

export const verify = (nacl: Nacl) => (
  msg: Message,
  sig: SignatureBuffer,
  pubkey: SignerPublicKey
): boolean => nacl.crypto_sign_verify_detached(sig, msg, pubkey);
