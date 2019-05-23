import { As } from "type-tagger";
import { Address, ChainId, ConfirmedTransaction, Hash, Identity, Nonce, SignableBytes, SwapAbortTransaction, SwapClaimTransaction, SwapOfferTransaction, TransactionQuery, WithCreator } from "@iov/bcp";
import { QueryString } from "@iov/tendermint-rpc";
export declare function addressPrefix(chainId: ChainId): "iov" | "tiov";
/** Encodes raw bytes into a bech32 address */
export declare function encodeBnsAddress(prefix: "iov" | "tiov", bytes: Uint8Array): Address;
/** Decodes a printable address into bech32 object */
export declare function decodeBnsAddress(address: Address): {
    readonly prefix: string;
    readonly data: Uint8Array;
};
export declare function identityToAddress(identity: Identity): Address;
export declare type Condition = Uint8Array & As<"Condition">;
export declare function escrowCondition(id: Uint8Array): Condition;
export declare function conditionToAddress(chainId: ChainId, cond: Condition): Address;
export declare function isValidAddress(address: string): boolean;
export declare function appendSignBytes(bz: Uint8Array, chainId: ChainId, nonce: Nonce): SignableBytes;
export declare function arraysEqual(a: Uint8Array, b: Uint8Array): boolean;
/** Type to differentiate between a raw hash of the data and the id used internally in weave */
export declare type HashId = Uint8Array & As<"hashid">;
export declare function hashIdentifier(hash: Hash): HashId;
export declare function isHashIdentifier(ident: Uint8Array): ident is HashId;
export declare function hashFromIdentifier(ident: HashId): Hash;
export declare function bucketKey(bucket: string): Uint8Array;
export declare function indexKey(bucket: string, index: string): Uint8Array;
export declare function isConfirmedWithSwapOfferTransaction(tx: ConfirmedTransaction): tx is ConfirmedTransaction<SwapOfferTransaction & WithCreator>;
export declare function isConfirmedWithSwapClaimOrAbortTransaction(tx: ConfirmedTransaction): tx is ConfirmedTransaction<(SwapClaimTransaction | SwapAbortTransaction) & WithCreator>;
export declare function buildQueryString(query: TransactionQuery): QueryString;
