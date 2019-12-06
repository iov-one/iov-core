import { Address } from "@iov/bcp";
import { Ed25519, Ed25519Keypair, Sha256 } from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import Long from "long";

import { constants } from "./constants";

export class Derivation {
  public static isValidAddress(address: string): boolean {
    const ending = constants.addressSuffix;
    const tail = address.slice(-ending.length);
    if (tail !== ending) {
      return false;
    }
    const addressString = address.slice(0, -ending.length);
    // parse as unsigned base 10 number and verify re-encoding matches encoding
    // this is no leading zeros, no decimals, within 0 <= addressString <= 2**64-1
    const addressNumber = Long.fromString(addressString, true, 10); // true => unsigned
    return addressNumber.toString(10) === addressString;
  }

  public static pubkeyToAddress(pubkey: Uint8Array): Address {
    const suffix = constants.addressSuffix;
    // https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/lisk.cpp#L26
    const hash = new Sha256(pubkey).digest();
    const firstEightBytes = Array.from(hash.slice(0, 8));
    const addressString = Long.fromBytesLE(firstEightBytes, true).toString(10) + suffix;
    return addressString as Address;
  }

  public static async passphraseToKeypair(passphrase: string): Promise<Ed25519Keypair> {
    const encodedPassphrase = Encoding.toUtf8(passphrase);
    const hash = new Sha256(encodedPassphrase).digest();
    const keypair = await Ed25519.makeKeypair(hash);
    return keypair;
  }
}
