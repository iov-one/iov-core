// import shajs from 'sha.js';

import nacl_factory from "js-nacl";

type PublicKeyBuffer = Uint8Array;
type PrivateKeyBuffer = Uint8Array;
type SignatureBuffer = Uint8Array;
type Message = Uint8Array;
type NaclFactory = any; // TODO: better interface

interface IKeyPair {
  readonly pubkey: PublicKeyBuffer;
  readonly secret: PrivateKeyBuffer;
  readonly nonce: IReadonlyDictionary<number>;
}

interface IReadonlyDictionary<T> {
  readonly [key: string]: T;
}

// init must be called and the promise resolved before any other functions are called
export function initNacl(opts: any): Promise<any> {
  return new Promise((res: NaclFactory, _: any) => {
    const setup = nacl => res(nacl);
    // tslint:disable-next-line:no-expression-statement
    nacl_factory.instantiate(setup, opts);
  });
}

export function getAddress(nacl: NaclFactory, pubkey: PublicKeyBuffer): string {
  // this is a prefix for all pubkey signatures
  const id = getIdentifier(pubkey);
  const hash = nacl.crypto_hash_sha256;
  return hash(id)
    .toString("hex")
    .slice(0, 40); // 20 bytes
}

// ugh, how to get this to compile????
export function getIdentifier(pubkey: PublicKeyBuffer): Uint8Array {
  const prefix = Buffer.from("sigs/ed25519/");
  return new Uint8Array([...prefix, ...pubkey]);
}

// generateKeyPair creates a private/public key pair
export function generateKeyPair(nacl: NaclFactory): IKeyPair {
  const keypair: any = nacl.crypto_sign_keypair();
  return {
    nonce: {},
    pubkey: keypair.signPk,
    secret: keypair.signSk
  };
}

export function sign(nacl: NaclFactory, msg: Message, secret: PrivateKeyBuffer) : SignatureBuffer {
    return nacl.crypto_sign_detached(msg, secret);
}

export function verify(nacl: NaclFactory, msg: Message, sig: SignatureBuffer, pubkey: PublicKeyBuffer) : boolean {
    return nacl.crypto_sign_verify_detached(sig, msg, pubkey);
}