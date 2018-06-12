import { Sha256 } from "@iov/crypto";
import { AddressBytes, PublicKeyBundle } from "@iov/types";

export const keyToAddress = (key: PublicKeyBundle) =>
  Sha256.digest(keyToIdentifier(key)).then((bz: Uint8Array) => bz.slice(0, 20) as AddressBytes);

// TODO: better
export const keyToIdentifier = (key: PublicKeyBundle) =>
  Uint8Array.from([...stringToArray("sigs/ed25519/"), ...key.data]);

const map = Array.prototype.map;
export const stringToArray = (str: string) => Uint8Array.from(map.call(str, (x: string) => x.charCodeAt(0)));
