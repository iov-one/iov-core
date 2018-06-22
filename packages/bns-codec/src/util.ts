import { Encoding, Sha256 } from "@iov/crypto";
import { AddressBytes, Algorithm, ChainID, Nonce, PublicKeyBundle, SignableBytes } from "@iov/types";

export const keyToAddress = (key: PublicKeyBundle) =>
  Sha256.digest(keyToIdentifier(key)).then((bz: Uint8Array) => bz.slice(0, 20) as AddressBytes);

export const keyToIdentifier = (key: PublicKeyBundle) =>
  Uint8Array.from([...algoToPrefix(key.algo), ...key.data]);

const algoToPrefix = (algo: Algorithm) => {
  switch (algo) {
    case Algorithm.ED25519:
      return Encoding.encodeAsAscii("sigs/ed25519/");
    case Algorithm.SECP256K1:
      return Encoding.encodeAsAscii("sigs/secp256k1/");
    default:
      throw new Error("Unsupported algorithm: " + algo);
  }
};

const signCodev1: Uint8Array = Uint8Array.from([0, 0xca, 0xfe, 0]);

// append chainID and nonce to the raw tx bytes to prepare for signing
export const appendSignBytes = (bz: Uint8Array, chainId: ChainID, nonce: Nonce) => {
  if (chainId.length > 255) {
    throw new Error("chainId must not exceed a length of 255 characters");
  }
  return Uint8Array.from([
    ...signCodev1,
    chainId.length,
    ...Encoding.encodeAsAscii(chainId),
    ...nonce.toBytesBE(),
    ...bz,
  ]) as SignableBytes;
};

// tendermint hash (will be) first 20 bytes of sha256
// probably only works after 0.21, but no need to import ripemd160 now
export const tendermintHash = (data: Uint8Array) =>
  Sha256.digest(data).then((bz: Uint8Array) => bz.slice(0, 20));

export const hashId = Encoding.encodeAsAscii("hash/sha256/");
export const hashIdentifier = async (data: Uint8Array) =>
  Uint8Array.from([...hashId, ...(await Sha256.digest(data))]);

// typescript forces us to return number on reduce, so we count how many elements match
// and make sure it is all
export const arraysEqual = (a: Uint8Array, b: Uint8Array): boolean =>
  a.length === b.length && a.every((n: number, i: number): boolean => n === b[i]);

export const isHashIdentifier = (ident: Uint8Array): boolean =>
  arraysEqual(hashId, ident.slice(0, hashId.length));
