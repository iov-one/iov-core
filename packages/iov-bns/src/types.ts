import * as Long from "long";
import { As } from "type-tagger";

import { Algorithm, ChainId, PublicKeyBundle, PublicKeyBytes, SignatureBytes } from "@iov/base-types";
import { Address, ChainAddressPair, FullSignature, Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

import * as codecImpl from "./generated/codecimpl";

export interface BnsUsernamesByUsernameQuery {
  readonly username: string;
}

export interface BnsUsernamesByOwnerAddressQuery {
  readonly owner: Address;
}

export interface BnsUsernamesByChainAndAddressQuery {
  readonly chain: ChainId;
  readonly address: Address;
}

export type BnsUsernamesQuery =
  | BnsUsernamesByUsernameQuery
  | BnsUsernamesByOwnerAddressQuery
  | BnsUsernamesByChainAndAddressQuery;

export function isBnsUsernamesByUsernameQuery(
  query: BnsUsernamesQuery,
): query is BnsUsernamesByUsernameQuery {
  return typeof (query as BnsUsernamesByUsernameQuery).username !== "undefined";
}

export function isBnsUsernamesByOwnerAddressQuery(
  query: BnsUsernamesQuery,
): query is BnsUsernamesByOwnerAddressQuery {
  return typeof (query as BnsUsernamesByOwnerAddressQuery).owner !== "undefined";
}

export function isBnsUsernamesByChainAndAddressQuery(
  query: BnsUsernamesQuery,
): query is BnsUsernamesByChainAndAddressQuery {
  return (
    typeof (query as BnsUsernamesByChainAndAddressQuery).chain !== "undefined" &&
    typeof (query as BnsUsernamesByChainAndAddressQuery).address !== "undefined"
  );
}

export type BnsAddressBytes = Uint8Array & As<"bns-address-bytes">;

export interface BnsUsernameNft {
  readonly id: string;
  readonly owner: BnsAddressBytes;
  readonly addresses: ReadonlyArray<ChainAddressPair>;
}

export type PrivateKeyBytes = Uint8Array & As<"private-key">;
export interface PrivateKeyBundle {
  readonly algo: Algorithm;
  readonly data: PrivateKeyBytes;
}

export interface Result {
  readonly key: Uint8Array;
  readonly value: Uint8Array;
}

export interface Keyed {
  readonly _id: Uint8Array;
}

export interface Decoder<T extends {}> {
  readonly decode: (data: Uint8Array) => T;
}

export function decodePubkey(publicKey: codecImpl.crypto.IPublicKey): PublicKeyBundle {
  if (publicKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: publicKey.ed25519 as PublicKeyBytes,
    };
  } else {
    throw new Error("Unknown public key algorithm");
  }
}

export function decodePrivkey(privateKey: codecImpl.crypto.IPrivateKey): PrivateKeyBundle {
  if (privateKey.ed25519) {
    return {
      algo: Algorithm.Ed25519,
      data: privateKey.ed25519 as PrivateKeyBytes,
    };
  } else {
    throw new Error("Unknown private key algorithm");
  }
}

export const decodeSignature = (signature: codecImpl.crypto.ISignature): SignatureBytes => {
  if (signature.ed25519) {
    return signature.ed25519 as SignatureBytes;
  } else {
    throw new Error("Unknown private key algorithm");
  }
};

export const decodeFullSig = (sig: codecImpl.sigs.IStdSignature): FullSignature => ({
  nonce: asInt53(sig.sequence) as Nonce,
  pubkey: decodePubkey(ensure(sig.pubkey)),
  signature: decodeSignature(ensure(sig.signature)),
});

export const asNumber = (maybeLong: Long | number | null | undefined): number => {
  if (!maybeLong) {
    return 0;
  } else if (typeof maybeLong === "number") {
    return maybeLong;
  } else {
    return maybeLong.toInt();
  }
};

export function asInt53(input: Long | number | null | undefined): Int53 {
  if (!input) {
    return new Int53(0);
  } else if (typeof input === "number") {
    return new Int53(input);
  } else {
    return Int53.fromString(input.toString());
  }
}

export const ensure = <T>(maybe: T | null | undefined, msg?: string): T => {
  if (maybe === null || maybe === undefined) {
    throw new Error("missing " + (msg || "field"));
  }
  return maybe;
};
