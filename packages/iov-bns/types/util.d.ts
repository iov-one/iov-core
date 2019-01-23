import { As } from "type-tagger";
import { Address, BcpTxQuery, ChainId, ConfirmedTransaction, Nonce, PublicIdentity, SignableBytes, SwapClaimTransaction, SwapCounterTransaction, SwapTimeoutTransaction, TransactionId } from "@iov/bcp-types";
import { QueryString } from "@iov/tendermint-rpc";
export declare function addressPrefix(chainId: ChainId): "iov" | "tiov";
/** Encodes raw bytes into a bech32 address */
export declare function encodeBnsAddress(prefix: "iov" | "tiov", bytes: Uint8Array): Address;
/** Decodes a printable address into bech32 object */
export declare function decodeBnsAddress(address: Address): {
    readonly prefix: string;
    readonly data: Uint8Array;
};
export declare function identityToAddress(identity: PublicIdentity): Address;
export declare function isValidAddress(address: string): boolean;
export declare function appendSignBytes(bz: Uint8Array, chainId: ChainId, nonce: Nonce): SignableBytes;
export declare const arraysEqual: (a: Uint8Array, b: Uint8Array) => boolean;
export declare type HashId = Uint8Array & As<"hashid">;
export declare const hashId: Uint8Array;
export declare const preimageIdentifier: (data: Uint8Array) => HashId;
export declare const hashIdentifier: (hash: Uint8Array) => HashId;
export declare const isHashIdentifier: (ident: Uint8Array) => ident is HashId;
export declare const hashFromIdentifier: (ident: HashId) => Uint8Array;
export declare const bucketKey: (bucket: string) => Uint8Array;
export declare const indexKey: (bucket: string, index: string) => Uint8Array;
export declare function isConfirmedWithSwapCounterTransaction(tx: ConfirmedTransaction): tx is ConfirmedTransaction<SwapCounterTransaction>;
export declare function isConfirmedWithSwapClaimOrTimeoutTransaction(tx: ConfirmedTransaction): tx is ConfirmedTransaction<SwapClaimTransaction | SwapTimeoutTransaction>;
export declare function buildTxQuery(query: BcpTxQuery): QueryString;
export declare function buildTxHashQuery(id: TransactionId): QueryString;
