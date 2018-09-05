import { As } from "type-tagger";

import { Algorithm } from "./keys";

export type SignatureBytes = Uint8Array & As<"signature">;
export interface SignatureBundle {
  readonly algo: Algorithm;
  readonly signature: SignatureBytes;
}

export type PostableBytes = Uint8Array & As<"postable">;

export type TxId = Uint8Array & As<"txid">;

export interface TxQuery {
  readonly tags: ReadonlyArray<Tag>;
  readonly hash?: TxId; // TODO: support this in queries
  readonly height?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

export interface Tag {
  readonly key: string;
  readonly value: string;
  // TODO: be more general here, but how do we handle other types?
  // readonly value: string | number;
}
