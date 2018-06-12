// libsodium.js API: https://gist.github.com/webmaster128/b2dbe6d54d36dd168c9fabf441b9b09c

// use require instead of import because of this bug
// https://github.com/jedisct1/libsodium.js/issues/148
import sodium = require("libsodium-wrappers");

import shajs from "sha.js";

export class Encoding {
  public static toHex(data: Uint8Array): string {
    // tslint:disable-next-line:no-let
    let out: string = "";
    for (const byte of data) {
      out += ("0" + byte.toString(16)).slice(-2);
    }
    return out;
  }

  public static fromHex(hexstring: string): Uint8Array {
    if (hexstring.length % 2 !== 0) {
      throw new Error("hex string length must be a multiple of 2");
    }

    // tslint:disable-next-line:readonly-array
    const listOfInts: number[] = [];
    // tslint:disable-next-line:no-let
    for (let i = 0; i < hexstring.length; i += 2) {
      const hexByteAsString = hexstring.substr(i, 2);
      if (!hexByteAsString.match(/[0-9a-f]{2}/i)) {
        throw new Error("hex string contains invalid characters");
      }
      listOfInts.push(parseInt(hexByteAsString, 16));
    }
    return new Uint8Array(listOfInts);
  }
}

export interface Keypair {
  readonly pubkey: Uint8Array;
  readonly privkey: Uint8Array;
}

export class Ed25519 {
  public static async generateKeypair(): Promise<Keypair> {
    await sodium.ready;
    const keypair = sodium.crypto_sign_keypair();
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
