import { Sha256 } from "@iov/crypto";
import { AddressBytes, Algorithm, ChainID, Nonce, PublicKeyBundle, SignableBytes } from "@iov/types";

export const keyToAddress = (key: PublicKeyBundle) =>
  Sha256.digest(keyToIdentifier(key)).then((bz: Uint8Array) => bz.slice(0, 20) as AddressBytes);

export const keyToIdentifier = (key: PublicKeyBundle) =>
  Uint8Array.from([...algoToPrefix(key.algo), ...key.data]);

const algoToPrefix = (algo: Algorithm) => {
  switch (algo) {
    case Algorithm.ED25519:
      return decodeAscii("sigs/ed25519/");
    case Algorithm.SECP256K1:
      return decodeAscii("sigs/secp256k1/");
    default:
      throw new Error("Unsupported algorithm: " + algo);
  }
};

const toNums = (str: string) => str.split("").map((x: string) => x.charCodeAt(0));
export const decodeAscii = (str: string) => Uint8Array.from(toNums(str));

// append chainID and nonce to the raw tx bytes to prepare for signing
export const appendSignBytes = (bz: Uint8Array, chainID: ChainID, nonce: Nonce) =>
  Uint8Array.from([...bz, ...decodeAscii(chainID), ...nonce.toBytesBE()]) as SignableBytes;

// tendermint hash (will be) first 20 bytes of sha256
// probably only works after 0.21, but no need to import ripemd160 now
export const tendermintHash = (data: Uint8Array) =>
  Sha256.digest(data).then((bz: Uint8Array) => bz.slice(0, 20));

export const HashId = decodeAscii("hash/sha256/");
export const hashIdentifier = async (data: Uint8Array) =>
  Uint8Array.from([...HashId, ...(await Sha256.digest(data))]);

// typescript forces us to return number on reduce, so we count how many elements match
// and make sure it is all
export const arraysEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.reduce((acc: number, x: number, i: number) => (x === b[i] ? acc + 1 : acc)) === b.length;

export const isHashIdentifier = (ident: Uint8Array): boolean =>
  arraysEqual(HashId, ident.slice(0, HashId.length));
