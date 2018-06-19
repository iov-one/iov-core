// libsodium.js API: https://gist.github.com/webmaster128/b2dbe6d54d36dd168c9fabf441b9b09c

import BN = require("bn.js");
import elliptic = require("elliptic");
// use require instead of import because of this bug
// https://github.com/jedisct1/libsodium.js/issues/148
import sodium = require("libsodium-wrappers");
import shajs from "sha.js";

const secp256k1 = new elliptic.ec("secp256k1");
const secp256k1N = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", "hex");

export class Random {
  // Get `count` bytes of cryptographically secure random bytes
  public static async getBytes(count: number): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.randombytes_buf(count);
  }
}

export interface Keypair {
  readonly pubkey: Uint8Array;
  readonly privkey: Uint8Array;
}

export class Ed25519 {
  // Generates a keypair deterministically from a given 32 bytes seed
  //
  // For implementation details see crypto_sign_seed_keypair in
  // https://download.libsodium.org/doc/public-key_cryptography/public-key_signatures.html
  public static async generateKeypair(seed: Uint8Array): Promise<Keypair> {
    await sodium.ready;
    const keypair = sodium.crypto_sign_seed_keypair(seed);
    return {
      pubkey: keypair.publicKey,
      privkey: keypair.privateKey,
    };
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

export class Secp256k1 {
  public static async makeKeypair(privkey: Uint8Array): Promise<Keypair> {
    if (privkey.length !== 32) {
      // is this check missing in secp256k1.validatePrivateKey?
      // https://github.com/bitjson/bitcoin-ts/issues/4
      throw new Error("input data is not a valid secp256k1 private key");
    }

    const keypair = secp256k1.keyFromPrivate(privkey);
    if (keypair.validate().result !== true) {
      throw new Error("input data is not a valid secp256k1 private key");
    }

    // range test that is not part of the elliptic implementation
    const privkeyAsBigInteger = new BN(privkey);
    if (privkeyAsBigInteger.gte(secp256k1N)) {
      // not strictly smaller than N
      throw new Error("input data is not a valid secp256k1 private key");
    }

    return {
      privkey: keypair.getPrivate(),
      pubkey: keypair.getPublic(),
    };
  }

  // Creates a signature that is
  // - deterministic (RFC 6979)
  // - lowS signature
  // - DER encoded
  public static async createSignature(message: Uint8Array, privkey: Uint8Array): Promise<Uint8Array> {
    const messageHash = await Sha256.digest(message);
    const keypair = secp256k1.keyFromPrivate(privkey);
    // the `canonical` option ensures creation of lowS signature representations
    const signature = new Uint8Array(keypair.sign(messageHash, { canonical: true }).toDER());
    return signature;
  }

  public static async verifySignature(
    signature: Uint8Array,
    message: Uint8Array,
    pubkey: Uint8Array,
  ): Promise<boolean> {
    const messageHash = await Sha256.digest(message);
    const keypair = secp256k1.keyFromPublic(pubkey);

    // From https://github.com/indutny/elliptic:
    //
    //     Sign the message's hash (input must be an array, or a hex-string)
    //
    //     Signature MUST be either:
    //     1) DER-encoded signature as hex-string; or
    //     2) DER-encoded signature as buffer; or
    //     3) object with two hex-string properties (r and s); or
    //     4) object with two buffer properties (r and s)
    //
    // Uint8Array is not a Buffer, but elliptic seems to be happy with the interface
    // common to both types. Uint8Array is not an array of ints but the interface is
    // similar
    try {
      return keypair.verify(messageHash, signature);
    } catch (error) {
      return false;
    }
  }
}

export class Sha256 {
  // async interface to support implementations that rely on WebAssemby compilation later on
  public static digest(data: Uint8Array): Promise<Uint8Array> {
    const hasher = shajs("sha256");
    hasher.update(data);
    return Promise.resolve(hasher.digest());
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
