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
}
