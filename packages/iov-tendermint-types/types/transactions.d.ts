import { As } from "type-tagger";
export declare type SignatureBytes = Uint8Array & As<"signature">;
export declare type PostableBytes = Uint8Array & As<"postable">;
export declare type TxId = Uint8Array & As<"txid">;
export interface TxQuery {
    readonly tags: ReadonlyArray<Tag>;
    readonly hash?: TxId;
    readonly height?: number;
    readonly minHeight?: number;
    readonly maxHeight?: number;
}
export interface Tag {
    readonly key: string;
    readonly value: string;
}
