import { As } from "type-tagger";

export enum Algorithm {
  Ed25519 = "ed25519",
  Secp256k1 = "secp256k1",
}

export type PublicKeyBytes = Uint8Array & As<"public-key">;
export interface PublicKeyBundle {
  readonly algo: Algorithm;
  readonly data: PublicKeyBytes;
}

/** Used to differentiate a blockchain. Should be alphanumeric or -_/ and unique */
export type ChainId = string & As<"chain-id">;

export type SignatureBytes = Uint8Array & As<"signature">;

export type PostableBytes = Uint8Array & As<"postable">;

export type TxId = Uint8Array & As<"txid">;
