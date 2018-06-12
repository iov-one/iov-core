import { Sha256 } from "@iov/crypto";
import { AddressBytes, Algorithm, ChainID, Nonce, PublicKeyBundle, SignableBytes } from "@iov/types";

export const keyToAddress = (key: PublicKeyBundle) =>
  Sha256.digest(keyToIdentifier(key)).then((bz: Uint8Array) => bz.slice(0, 20) as AddressBytes);

export const keyToIdentifier = (key: PublicKeyBundle) =>
  Uint8Array.from([...algoToPrefix(key.algo), ...key.data]);

const algoToPrefix = (algo: Algorithm) => {
  switch (algo) {
    case Algorithm.ED25519:
      return stringToArray("sigs/ed25519/");
    case Algorithm.SECP256K1:
      return stringToArray("sigs/secp256k1/");
    default:
      throw new Error("Unsupported algorithm: " + algo);
  }
};

const map = Array.prototype.map;
const toNums = (str: string) => map.call(str, (x: string) => x.charCodeAt(0));
export const stringToArray = (str: string) => Uint8Array.from(toNums(str));

// append chainID and nonce to the raw tx bytes to prepare for signing
export const appendSignBytes = (bz: Uint8Array, chainID: ChainID, nonce: Nonce) =>
  Uint8Array.from([...bz, ...stringToArray(chainID), ...nonce.toBytesBE()]) as SignableBytes;

// tendermint hash (will be) first 20 bytes of sha256
// probably only works after 0.21, but no need to import ripemd160 now
export const tendermintHash = (data: Uint8Array) =>
  Sha256.digest(data).then((bz: Uint8Array) => bz.slice(0, 20));

// TODO: verify prefix, make const
export const hashPreimage = (data: Uint8Array) => Sha256.digest(data);
export const hashIdentifier = (hash: Uint8Array) =>
  Uint8Array.from([...stringToArray("hash/sha256/"), ...hash]);
