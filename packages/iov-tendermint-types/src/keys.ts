import { As } from "type-tagger";

export enum Algorithm {
  ED25519 = "ed25519",
  SECP256K1 = "secp256k1",
}

export type PrivateKeyBytes = Uint8Array & As<"private-key">;
export interface PrivateKeyBundle {
  readonly algo: Algorithm;
  readonly data: PrivateKeyBytes;
}

export type PublicKeyBytes = Uint8Array & As<"public-key">;
export interface PublicKeyBundle {
  readonly algo: Algorithm;
  readonly data: PublicKeyBytes;
}
