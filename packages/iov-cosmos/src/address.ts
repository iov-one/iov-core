import { Address, Algorithm, PubkeyBundle, PubkeyBytes } from "@iov/bcp";
import { Ripemd160, Secp256k1, Sha256 } from "@iov/crypto";
import { Bech32 } from "@iov/encoding";
import { marshalPubKey } from "@tendermint/amino-js";

import { encodePubkey } from "./encode";

export type CosmosAddressBech32Prefix = "cosmos" | "cosmosvalcons" | "cosmosvaloper";
export type CosmosPubkeyBech32Prefix = "cosmospub" | "cosmosvalconspub" | "cosmosvaloperpub";
export type CosmosBech32Prefix = CosmosAddressBech32Prefix | CosmosPubkeyBech32Prefix;

function isCosmosAddressBech32Prefix(prefix: string): prefix is CosmosAddressBech32Prefix {
  return ["cosmos", "cosmosvalcons", "cosmosvaloper"].includes(prefix);
}

export function decodeCosmosAddress(
  address: Address,
): { readonly prefix: CosmosAddressBech32Prefix; readonly data: Uint8Array } {
  const { prefix, data } = Bech32.decode(address);
  if (!isCosmosAddressBech32Prefix(prefix)) {
    throw new Error(`Invalid bech32 prefix. Must be one of cosmos, cosmosvalcons, or cosmosvaloper.`);
  }
  if (data.length !== 20) {
    throw new Error("Invalid data length. Expected 20 bytes.");
  }
  return { prefix: prefix, data: data };
}

export function isValidAddress(address: string): boolean {
  try {
    decodeCosmosAddress(address as Address);
    return true;
  } catch {
    return false;
  }
}

// See https://github.com/tendermint/tendermint/blob/f2ada0a604b4c0763bda2f64fac53d506d3beca7/docs/spec/blockchain/encoding.md#public-key-cryptography
export function pubkeyToAddress(pubkey: PubkeyBundle, prefix: CosmosBech32Prefix): Address {
  const compressedPubkey = {
    ...pubkey,
    data: Secp256k1.compressPubkey(pubkey.data) as PubkeyBytes,
  };
  const encoded = encodePubkey(compressedPubkey);
  const marshalled = marshalPubKey(encoded).slice(6);

  switch (pubkey.algo) {
    case Algorithm.Secp256k1: {
      const hash1 = new Sha256(marshalled).digest();
      const hash2 = new Ripemd160(hash1).digest();
      return Bech32.encode(prefix, hash2) as Address;
    }
    case Algorithm.Ed25519: {
      throw new Error("Ed25519 public keys are not currently supported");
    }
    default:
      throw new Error("Unrecognized public key algorithm");
  }
}
