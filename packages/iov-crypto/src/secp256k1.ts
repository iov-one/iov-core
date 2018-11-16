import { Encoding } from "@iov/encoding";

import BN = require("bn.js");
import elliptic = require("elliptic");

const secp256k1 = new elliptic.ec("secp256k1");
const secp256k1N = new BN("FFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFEBAAEDCE6AF48A03BBFD25E8CD0364141", "hex");

export declare const Secp256k1KeypairSymbol: unique symbol;
export type Secp256k1Keypair = typeof Secp256k1KeypairSymbol & {
  readonly pubkey: Uint8Array;
  readonly privkey: Uint8Array;
};

export class Secp256k1 {
  public static async makeKeypair(privkey: Uint8Array): Promise<Secp256k1Keypair> {
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

    // tslint:disable-next-line:no-object-literal-type-assertion
    return {
      privkey: Encoding.fromHex(keypair.getPrivate("hex")),
      // encodes uncompressed as
      // - 1-byte prefix "04"
      // - 32-byte x coordinate
      // - 32-byte y coordinate
      pubkey: Encoding.fromHex(keypair.getPublic().encode("hex")),
    } as Secp256k1Keypair;
  }

  // Creates a signature that is
  // - deterministic (RFC 6979)
  // - lowS signature
  // - DER encoded
  public static async createSignature(messageHash: Uint8Array, privkey: Uint8Array): Promise<Uint8Array> {
    if (messageHash.length === 0) {
      throw new Error("Message hash must not be empty");
    }
    if (messageHash.length > 32) {
      throw new Error("Message hash length must not exceed 32 bytes");
    }

    const keypair = secp256k1.keyFromPrivate(privkey);
    // the `canonical` option ensures creation of lowS signature representations
    const signature = new Uint8Array(keypair.sign(messageHash, { canonical: true }).toDER());
    return signature;
  }

  public static async createSignatureEth(message: Uint8Array, privkey: Uint8Array): Promise<Uint8Array> {
    const keypair = secp256k1.keyFromPrivate(privkey);
    const signatureBase = keypair.sign(message, { canonical: true });
    const signature = new Uint8Array(signatureBase.toDER());
    return signature;
  }

  public static async verifySignature(
    signature: Uint8Array,
    messageHash: Uint8Array,
    pubkey: Uint8Array,
  ): Promise<boolean> {
    if (messageHash.length === 0) {
      throw new Error("Message hash must not be empty");
    }
    if (messageHash.length > 32) {
      throw new Error("Message hash length must not exceed 32 bytes");
    }

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
