export type NaclCallback = (nacl: Nacl) => void;
export interface NaclOpts {
  readonly [key: string]: any;
}

// types for signing
export type SignerSecretKey = Uint8Array;
export type SignerPublicKey = Uint8Array;
export interface SignKeyPair {
  signPk: SignerPublicKey;
  signSk: SignerSecretKey;
}
export type Message = Uint8Array;
export type Signature = Uint8Array;
export type MessageWithSignature = Uint8Array;

// Nacl functions taken from js-nacl api spec
export interface Nacl {
  // strings vs. binary
  to_hex: (arr: Uint8Array) => string;
  from_hex: (hex: string) => Uint8Array;
  encode_utf8: (utf8: string) => Uint8Array;
  encode_latin1: (latin1: string) => Uint8Array;
  decode_utf8: (arr: Uint8Array) => string;
  decode_latin1: (arr: Uint8Array) => string;

  // hash
  crypto_hash: (raw: Uint8Array) => Uint8Array;
  crypto_hash_sha256: (raw: Uint8Array) => Uint8Array;

  // TODO: crypto_box, crypto_secretbox, crypto_stream

  // crypto_sign
  crypto_sign_keypair: () => SignKeyPair;
  crypto_sign: (msg: Message, sk: SignerSecretKey) => MessageWithSignature;
  crypto_sign_open: (
    packet: MessageWithSignature,
    pk: SignerPublicKey
  ) => Message | null;
  crypto_sign_detached: (msg: Message, sk: SignerSecretKey) => Signature;
  crypto_sign_verify_detached: (
    sig: Signature,
    msg: Message,
    pk: SignerPublicKey
  ) => boolean;

  // derived keys
  crypto_sign_seed_keypair: (seed: Uint8Array) => SignKeyPair;
  // TODO: derived box keypairs
}
