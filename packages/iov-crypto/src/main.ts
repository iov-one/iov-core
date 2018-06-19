// Keep all classes requiring libsodium-js in one file as having multiple
// requiring of the libsodium-wrappers module currently crashes browsers
//
// libsodium.js API: https://gist.github.com/webmaster128/b2dbe6d54d36dd168c9fabf441b9b09c

// use require instead of import because of this bug
// https://github.com/jedisct1/libsodium.js/issues/148
import sodium = require("libsodium-wrappers");

export class Random {
  // Get `count` bytes of cryptographically secure random bytes
  public static async getBytes(count: number): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.randombytes_buf(count);
  }
}

declare const Ed25519KeypairSymbol: unique symbol;
export type Ed25519Keypair = typeof Ed25519KeypairSymbol & {
  readonly pubkey: Uint8Array;
  readonly privkey: Uint8Array;
}

export class Ed25519 {
  // Generates a keypair deterministically from a given 32 bytes seed
  //
  // For implementation details see crypto_sign_seed_keypair in
  // https://download.libsodium.org/doc/public-key_cryptography/public-key_signatures.html
  public static async generateKeypair(seed: Uint8Array): Promise<Ed25519Keypair> {
    await sodium.ready;
    const keypair = sodium.crypto_sign_seed_keypair(seed);

    // tslint:disable-next-line:no-object-literal-type-assertion
    return {
      pubkey: keypair.publicKey,
      privkey: keypair.privateKey,
    } as Ed25519Keypair;
  }

  public static async createSignature(message: Uint8Array, privkey: Uint8Array): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.crypto_sign_detached(message, privkey);
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
  public static async encrypt(message: Uint8Array, key: Uint8Array, nonce: Uint8Array): Promise<Uint8Array> {
    await sodium.ready;

    const additionalData = undefined;

    return sodium.crypto_aead_chacha20poly1305_ietf_encrypt(
      message,
      additionalData,
      null, // secret nonce: unused and should be null (https://download.libsodium.org/doc/secret-key_cryptography/ietf_chacha20-poly1305_construction.html)
      nonce,
      key,
    );
  }

  public static async decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    nonce: Uint8Array,
  ): Promise<Uint8Array> {
    await sodium.ready;

    const additionalData = undefined;

    return sodium.crypto_aead_chacha20poly1305_ietf_decrypt(
      null, // secret nonce: unused and should be null (https://download.libsodium.org/doc/secret-key_cryptography/ietf_chacha20-poly1305_construction.html)
      ciphertext,
      additionalData,
      nonce,
      key,
    );
  }
}
