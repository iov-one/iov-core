import { ReadonlyDate } from "readonly-date";
import { As } from "type-tagger";
import { Stream } from "xstream";
import { ChainId, PostableBytes, PublicKeyBundle } from "@iov/base-types";
import { ValueAndUpdates } from "@iov/stream";
import { Address, Amount, Nonce, SignedTransaction, TokenTicker, TransactionId, UnsignedTransaction } from "./transactions";
export interface BcpQueryEnvelope<T> {
    readonly metadata: BcpQueryMetadata;
    readonly data: ReadonlyArray<T>;
}
export declare function dummyEnvelope<T>(data: ReadonlyArray<T>): BcpQueryEnvelope<T>;
export interface BcpQueryMetadata {
    readonly offset: number;
    readonly limit: number;
}
export interface BcpCoin extends BcpTicker, Amount {
}
export interface BcpAccount {
    readonly address: Address;
    /**
     * The public key, if available.
     *
     * - Always available if the full pubkey is encoded in the address (e.g. nano, Substrate/Polkadot)
     * - Available after first transaction sent (e.g. Lisk, Tendermint, Ethereum)
     */
    readonly pubkey?: PublicKeyBundle;
    readonly name?: string;
    readonly balance: ReadonlyArray<BcpCoin>;
}
export interface BcpTicker {
    readonly tokenTicker: TokenTicker;
    /**
     * A name to be displayed to the user which allows differentiation
     * of multiple tokens that use the same ticker.
     *
     * For example "Holo (HOT)" and "Hydro Protocol (HOT)" get the token
     * names and "Holo" and "Hydro Protocol".
     */
    readonly tokenName: string;
}
export declare enum BcpTransactionState {
    /** accepted by a blockchain node and in mempool */
    Pending = 0,
    /** successfully written in a block, but cannot yet guarantee it won't be reverted */
    InBlock = 1
}
export interface BcpBlockInfoPending {
    readonly state: BcpTransactionState.Pending;
}
export interface BcpBlockInfoInBlock {
    readonly state: BcpTransactionState.InBlock;
    /** block height, if the transaction is included in a block */
    readonly height: number;
    /** depth of the transaction's block, starting at 1 as soon as transaction is in a block */
    readonly confirmations: number;
    /** application specific data from executing tx (result, code, tags...) */
    readonly result?: Uint8Array;
}
/** Information attached to a signature about its state in a block */
export declare type BcpBlockInfo = BcpBlockInfoPending | BcpBlockInfoInBlock;
export interface PostTxResponse {
    /** Information about the block the transaction is in */
    readonly blockInfo: ValueAndUpdates<BcpBlockInfo>;
    /** a unique identifier (hash of the transaction) */
    readonly transactionId: TransactionId;
    /** a human readable debugging log */
    readonly log?: string;
}
export interface ConfirmedTransaction<T extends UnsignedTransaction = UnsignedTransaction> extends SignedTransaction<T> {
    readonly height: number;
    /** depth of the transaction's block, starting at 1 as soon as transaction is in a block */
    readonly confirmations: number;
    /** a unique identifier (hash of the transaction) */
    readonly transactionId: TransactionId;
    /** application specific data from executing tx (result, code, tags...) */
    readonly result?: Uint8Array;
    readonly log?: string;
}
export interface BcpQueryTag {
    readonly key: string;
    readonly value: string;
}
export interface BcpTxQuery {
    readonly id?: TransactionId;
    /** chain-specific key value pairs that encode a query */
    readonly tags?: ReadonlyArray<BcpQueryTag>;
    readonly height?: number;
    readonly minHeight?: number;
    readonly maxHeight?: number;
}
export interface BcpAddressQuery {
    readonly address: Address;
}
export interface BcpValueNameQuery {
    readonly name: string;
}
export interface BcpPubkeyQuery {
    readonly pubkey: PublicKeyBundle;
}
export declare type BcpAccountQuery = BcpAddressQuery | BcpPubkeyQuery | BcpValueNameQuery;
export declare function isAddressQuery(query: BcpAccountQuery): query is BcpAddressQuery;
export declare function isPubkeyQuery(query: BcpAccountQuery): query is BcpPubkeyQuery;
export declare function isValueNameQuery(query: BcpAccountQuery): query is BcpValueNameQuery;
/**
 * A printable block ID in a blockchain-specific format.
 *
 * In Lisk, this is a uint64 number like 3444561236416494115 and in BNS this is an upper
 * hex encoded 20 byte hash like 6DD2BFCD9CEFE93C64C15439C513BFD61A0225BB. Ethereum uses
 * 0x-prefixed hashes like 0x4bd6efe48bed3ea4fd25678cc81d1ed372bb8c8654c29880889fed66130c6502
 */
export declare type BlockId = string & As<"block-id">;
export interface BlockHeader {
    readonly id: BlockId;
    readonly height: number;
    readonly time: ReadonlyDate;
    readonly transactionCount: number;
}
export interface BcpConnection {
    readonly disconnect: () => void;
    readonly chainId: () => ChainId;
    readonly height: () => Promise<number>;
    readonly getTicker: (ticker: TokenTicker) => Promise<BcpQueryEnvelope<BcpTicker>>;
    readonly getAllTickers: () => Promise<BcpQueryEnvelope<BcpTicker>>;
    /**
     * Get the current account information (e.g. balance)
     *
     * If an account is not found on the blockchain, an envelope with an empty data array is returned
     */
    readonly getAccount: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpAccount>>;
    /**
     * Get a nonce for the next transaction signature.
     *
     * Implementation defines a default value if blockchain does not provide a nonce.
     */
    readonly getNonce: (query: BcpAddressQuery | BcpPubkeyQuery) => Promise<Nonce>;
    readonly watchAccount: (account: BcpAccountQuery) => Stream<BcpAccount | undefined>;
    readonly watchNonce: (query: BcpAddressQuery | BcpPubkeyQuery) => Stream<Nonce>;
    readonly getBlockHeader: (height: number) => Promise<BlockHeader>;
    readonly watchBlockHeaders: () => Stream<BlockHeader>;
    /** @deprecated use watchBlockHeaders().map(header => header.height) */
    readonly changeBlock: () => Stream<number>;
    readonly postTx: (tx: PostableBytes) => Promise<PostTxResponse>;
    readonly searchTx: (query: BcpTxQuery) => Promise<ReadonlyArray<ConfirmedTransaction>>;
    /**
     * Subscribes to all newly added transactions that match the query
     */
    readonly listenTx: (query: BcpTxQuery) => Stream<ConfirmedTransaction>;
    /**
     * Returns a stream for all historical transactions that match
     * the query, along with all new transactions arriving from listenTx
     */
    readonly liveTx: (txQuery: BcpTxQuery) => Stream<ConfirmedTransaction>;
}
