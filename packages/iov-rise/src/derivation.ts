import { Address } from "@iov/bcp";
import { Derivation } from "@iov/dpos";

import { constants } from "./constants";

export function pubkeyToAddress(pubkey: Uint8Array): Address {
  return Derivation.pubkeyToAddress(pubkey, constants.addressSuffix);
}

export function isValidAddress(address: string): boolean {
  return Derivation.isValidAddressWithEnding(address, constants.addressSuffix);
}
