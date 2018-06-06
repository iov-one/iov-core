// libsodium.js API: https://gist.github.com/webmaster128/b2dbe6d54d36dd168c9fabf441b9b09c

// use require instead of import because of this bug
// https://github.com/jedisct1/libsodium.js/issues/148
import sodium = require("libsodium-wrappers");

interface KeyPair {
  pubkey: Uint8Array,
  privkey: Uint8Array,
}

export class Ed25519 {
  static async generateKeypair(): Promise<KeyPair> {
    await sodium.ready;
    let keypair = sodium.crypto_sign_keypair();
    return {
      pubkey: keypair.publicKey,
      privkey: keypair.privateKey
    }
  }

  static async createSignature(message: Uint8Array, privkey: Uint8Array): Promise<Uint8Array> {
    await sodium.ready;
    return sodium.crypto_sign_detached(message, privkey);
  }
}
