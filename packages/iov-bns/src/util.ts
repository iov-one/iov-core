import Long from "long";
import { As } from "type-tagger";

import {
  Address,
  Algorithm,
  BcpTxQuery,
  ChainId,
  ConfirmedTransaction,
  isSwapClaimTransaction,
  isSwapCounterTransaction,
  isSwapTimeoutTransaction,
  Nonce,
  PublicIdentity,
  PublicKeyBundle,
  SignableBytes,
  SwapClaimTransaction,
  SwapCounterTransaction,
  SwapTimeoutTransaction,
  TransactionId,
} from "@iov/bcp-types";
import { Sha256 } from "@iov/crypto";
import { Bech32, Encoding } from "@iov/encoding";
import { QueryString } from "@iov/tendermint-rpc";

const bnsMainnetChainId = "PLEASE_INSERT_HERE_WHEN_GENESIS_EXISTS" as ChainId;

export function addressPrefix(chainId: ChainId): "iov" | "tiov" {
  return chainId === bnsMainnetChainId ? "iov" : "tiov";
}

/** Encodes raw bytes into a bech32 address */
export function encodeBnsAddress(prefix: "iov" | "tiov", bytes: Uint8Array): Address {
  return Bech32.encode(prefix, bytes) as Address;
}

/** Decodes a printable address into bech32 object */
export function decodeBnsAddress(address: Address): { readonly prefix: string; readonly data: Uint8Array } {
  return Bech32.decode(address);
}

function algoToPrefix(algo: Algorithm): Uint8Array {
  switch (algo) {
    case Algorithm.Ed25519:
      return Encoding.toAscii("sigs/ed25519/");
    case Algorithm.Secp256k1:
      return Encoding.toAscii("sigs/secp256k1/");
    default:
      throw new Error("Unsupported algorithm: " + algo);
  }
}

function keyToIdentifier(key: PublicKeyBundle): Uint8Array {
  return Uint8Array.from([...algoToPrefix(key.algo), ...key.data]);
}

export function identityToAddress(identity: PublicIdentity): Address {
  const prefix = addressPrefix(identity.chainId);
  const bytes = new Sha256(keyToIdentifier(identity.pubkey)).digest().slice(0, 20);
  return encodeBnsAddress(prefix, bytes);
}

export function isValidAddress(address: string): boolean {
  try {
    decodeBnsAddress(address as Address);
    return true;
  } catch {
    return false;
  }
}

const signCodev1: Uint8Array = Uint8Array.from([0, 0xca, 0xfe, 0]);

// append chainID and nonce to the raw tx bytes to prepare for signing
export function appendSignBytes(bz: Uint8Array, chainId: ChainId, nonce: Nonce): SignableBytes {
  if (chainId.length > 255) {
    throw new Error("chainId must not exceed a length of 255 characters");
  }
  return Uint8Array.from([
    ...signCodev1,
    chainId.length,
    ...Encoding.toAscii(chainId),
    ...Long.fromNumber(nonce.toNumber()).toBytesBE(),
    ...bz,
  ]) as SignableBytes;
}

export function arraysEqual(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

/** Type to differentiate between a raw hash of the data and the id used internally in weave */
export type HashId = Uint8Array & As<"hashid">;

export const hashId = Encoding.toAscii("hash/sha256/");

export function preimageIdentifier(preimage: Uint8Array): HashId {
  const hash = new Sha256(preimage).digest();
  return hashIdentifier(hash);
}

export function hashIdentifier(hash: Uint8Array): HashId {
  return Uint8Array.from([...hashId, ...hash]) as HashId;
}

export function isHashIdentifier(ident: Uint8Array): ident is HashId {
  const prefix = ident.slice(0, hashId.length);
  return arraysEqual(hashId, prefix);
}

export function hashFromIdentifier(ident: HashId): Uint8Array {
  return ident.slice(hashId.length);
}

// calculate keys for query tags
export function bucketKey(bucket: string): Uint8Array {
  return Encoding.toAscii(`${bucket}:`);
}

export function indexKey(bucket: string, index: string): Uint8Array {
  return Encoding.toAscii(`_i.${bucket}_${index}:`);
}

export function isConfirmedWithSwapCounterTransaction(
  tx: ConfirmedTransaction,
): tx is ConfirmedTransaction<SwapCounterTransaction> {
  const unsigned = tx.transaction;
  return isSwapCounterTransaction(unsigned);
}

export function isConfirmedWithSwapClaimOrTimeoutTransaction(
  tx: ConfirmedTransaction,
): tx is ConfirmedTransaction<SwapClaimTransaction | SwapTimeoutTransaction> {
  const unsigned = tx.transaction;
  return isSwapClaimTransaction(unsigned) || isSwapTimeoutTransaction(unsigned);
}

function sentFromOrToTag(addr: Address): string {
  const id = Uint8Array.from([...Encoding.toAscii("cash:"), ...decodeBnsAddress(addr).data]);
  const key = Encoding.toHex(id).toUpperCase();
  const value = "s"; // "s" for "set"
  return `${key}='${value}'`;
}

export function buildTxQuery(query: BcpTxQuery): QueryString {
  const sentComponents = query.sentFromOrTo !== undefined ? [sentFromOrToTag(query.sentFromOrTo)] : [];
  const tagComponents = query.tags !== undefined ? query.tags.map(tag => `${tag.key}='${tag.value}'`) : [];
  // In Tendermint, hash can be lower case for search queries but must be upper case for subscribe queries
  const hashComponents = query.id !== undefined ? [`tx.hash='${query.id}'`] : [];
  const heightComponents = query.height !== undefined ? [`tx.height=${query.height}`] : [];
  const minHeightComponents = query.minHeight !== undefined ? [`tx.height>${query.minHeight}`] : [];
  const maxHeightComponents = query.maxHeight !== undefined ? [`tx.height<${query.maxHeight}`] : [];

  const components: ReadonlyArray<string> = [
    ...sentComponents,
    ...tagComponents,
    ...hashComponents,
    ...heightComponents,
    ...minHeightComponents,
    ...maxHeightComponents,
  ];
  return components.join(" AND ") as QueryString;
}

export function buildTxHashQuery(id: TransactionId): QueryString {
  // In Tendermint, hash can be lower case for search queries but must be
  // upper case for subscribe queries. TransactionId is always upper case hex.
  return `tx.hash='${id}'` as QueryString;
}
