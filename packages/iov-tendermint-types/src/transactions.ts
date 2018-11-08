import { As } from "type-tagger";

export type SignatureBytes = Uint8Array & As<"signature">;

export type PostableBytes = Uint8Array & As<"postable">;

export type TxId = Uint8Array & As<"txid">;
