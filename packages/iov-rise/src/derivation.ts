import Long from "long";

import { Address } from "@iov/bcp-types";
import { Sha256 } from "@iov/crypto";
import { Derivation } from "@iov/dpos";

export function pubkeyToAddress(pubkey: Uint8Array): Address {
  // https://github.com/prolina-foundation/snapshot-validator/blob/35621c7/src/lisk.cpp#L26
  const hash = new Sha256(pubkey).digest();
  const firstEightBytes = Array.from(hash.slice(0, 8));
  const addressString = Long.fromBytesLE(firstEightBytes, true).toString(10) + "R";
  return addressString as Address;
}

export function isValidAddress(address: string): boolean {
  return Derivation.isValidAddressWithEnding(address, "R");
}
