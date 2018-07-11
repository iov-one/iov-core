// Keep all classes requiring libsodium-js in one file as having multiple
// requiring of the libsodium-wrappers module currently crashes browsers
//
// libsodium.js API: https://gist.github.com/webmaster128/b2dbe6d54d36dd168c9fabf441b9b09c

// use require instead of import because of this bug
// https://github.com/jedisct1/libsodium.js/issues/148
import sodium = require("libsodium-wrappers");

// type tagging from https://github.com/Microsoft/TypeScript/issues/4895#issuecomment-399098397
declare class As<Tag extends string> {
  private readonly "_ _ _": Tag;
}

export type Chacha20poly1305IetfKey = Uint8Array & As<"chacha20poly1305ietf-key">;
export type Chacha20poly1305IetfMessage = Uint8Array & As<"chacha20poly1305ietf-message">;
export type Chacha20poly1305IetfNonce = Uint8Array & As<"chacha20poly1305ietf-nonce">;
export type Chacha20poly1305IetfCiphertext = Uint8Array & As<"chacha20poly1305ietf-ciphertext">;

export class Random {
  // Get `count` bytes of cryptographically secure random bytes
  public static async getBytes(count: number): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.randombytes_buf(count);
  }
}

export class Ed25519Keypair {
  // a libsodium privkey has the format `<ed25519 privkey> + <ed25519 pubkey>`
  public static fromLibsodiumPrivkey(libsodiumPrivkey: Uint8Array): Ed25519Keypair {
    if (libsodiumPrivkey.length !== 64) {
      throw new Error(`Unexpected key length ${libsodiumPrivkey.length}. Must be 64.`);
    }
    return new Ed25519Keypair(libsodiumPrivkey.slice(0, 32), libsodiumPrivkey.slice(32, 64));
  }

  constructor(public readonly privkey: Uint8Array, public readonly pubkey: Uint8Array) {}

  public toLibsodiumPrivkey(): Uint8Array {
    return new Uint8Array([...this.privkey, ...this.pubkey]);
  }
}

export class Ed25519 {
  // Generates a keypair deterministically from a given 32 bytes seed.
  // This seed equals the Ed25519 private key.
  //
  // For implementation details see crypto_sign_seed_keypair in
  // https://download.libsodium.org/doc/public-key_cryptography/public-key_signatures.html
  // and diagram on https://blog.mozilla.org/warner/2011/11/29/ed25519-keys/
  public static async makeKeypair(seed: Uint8Array): Promise<Ed25519Keypair> {
    await sodium.ready;
    const keypair = sodium.crypto_sign_seed_keypair(seed);
    return Ed25519Keypair.fromLibsodiumPrivkey(keypair.privateKey);
  }

  public static async createSignature(message: Uint8Array, keyPair: Ed25519Keypair): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.crypto_sign_detached(message, keyPair.toLibsodiumPrivkey());
  }

  public static async verifySignature(
    signature: Uint8Array,
    message: Uint8Array,
    pubkey: Uint8Array,
  ): Promise<boolean> {
    await sodium.ready;
    return sodium.crypto_sign_verify_detached(signature, message, pubkey);
  }
}

export class Chacha20poly1305Ietf {
  public static async encrypt(
    message: Chacha20poly1305IetfMessage,
    key: Chacha20poly1305IetfKey,
    nonce: Chacha20poly1305IetfNonce,
  ): Promise<Chacha20poly1305IetfCiphertext> {
    await sodium.ready;

    const additionalData = undefined;

    return sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
      message,
      additionalData,
      null, // secret nonce: unused and should be null (https://download.libsodium.org/doc/secret-key_cryptography/ietf_chacha20-poly1305_construction.html)
      nonce,
      key,
    ) as Chacha20poly1305IetfCiphertext;
  }

  public static async decrypt(
    ciphertext: Chacha20poly1305IetfCiphertext,
    key: Chacha20poly1305IetfKey,
    nonce: Chacha20poly1305IetfNonce,
  ): Promise<Chacha20poly1305IetfMessage> {
    await sodium.ready;

    const additionalData = undefined;

    return sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null, // secret nonce: unused and should be null (https://download.libsodium.org/doc/secret-key_cryptography/ietf_chacha20-poly1305_construction.html)
      ciphertext,
      additionalData,
      nonce,
      key,
    ) as Chacha20poly1305IetfMessage;
  }
}
