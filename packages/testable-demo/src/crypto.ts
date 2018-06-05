const sodium = require('libsodium-wrappers');

export class Ed25519 {
  static async generateKeypair(): Promise<any> {
    await sodium.ready;
    let keypair = sodium.crypto_sign_keypair();
    return {
      pubkey: keypair.publicKey,
      privkey: keypair.privateKey
    }
  }
}
