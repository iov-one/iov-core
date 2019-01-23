import { ReadonlyDate } from "readonly-date";
import { As } from "type-tagger";
import { Stream } from "xstream";
import { ValueAndUpdates } from "@iov/stream";
import { PostableBytes } from "./codec";
import { Address, Amount, ChainId, Nonce, PublicKeyBundle, SignedTransaction, TokenTicker, TransactionId, UnsignedTransaction } from "./transactions";
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
    /**
     * The number of fractional digits the token supports.
     *
     * A quantity is expressed as atomic units. 10^fractionalDigits of those
     * atomic units make up 1 token.
     *
     * E.g. in Ethereum 10^18 wei are 1 ETH and from the quantity 123000000000000000000
     * the last 18 digits are the fractional part and the rest the wole part.
     */
    readonly fractionalDigits: number;
}
export declare enum TransactionState {
    /** accepted by a blockchain node and in mempool */
    Pending = 0,
    /** successfully written in a block, but cannot yet guarantee it won't be reverted */
    Succeeded = 1,
    /** executing the transaction failed */
    Failed = 2
}
export interface BlockInfoPending {
    readonly state: TransactionState.Pending;
}
export interface BlockInfoSucceeded {
    readonly state: TransactionState.Succeeded;
    /** block height, if the transaction is included in a block */
    readonly height: number;
    /** depth of the transaction's block, starting at 1 as soon as transaction is in a block */
    readonly confirmations: number;
    /** application specific data from executing tx (result, code, tags...) */
    readonly result?: Uint8Array;
}
export interface BlockInfoFailed {
    readonly state: TransactionState.Failed;
    /**
     * Application specific error code
     */
    readonly code: number;
    /**
     * Application specific logging output in an arbitrary text format that
     * may change at any time.
     */
    readonly log?: string;
}
/** Information attached to a signature about its state in a block */
export declare type BlockInfo = BlockInfoPending | BlockInfoSucceeded | BlockInfoFailed;
export interface PostTxResponse {
    /** Information about the block the transaction is in */
    readonly blockInfo: ValueAndUpdates<BlockInfo>;
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
    /**
     * Application specific logging output in an arbitrary text format that
     * may change at any time.
     */
    readonly log?: string;
}
export interface FailedTransaction {
    /**
     * Application specific error code
     */
    readonly code: number;
    /**
     * Application specific logging output in an arbitrary text format that
     * may change at any time.
     */
    readonly log?: string;
}
export declare function isConfirmedTransaction(transaction: ConfirmedTransaction | FailedTransaction): transaction is ConfirmedTransaction;
export declare function isFailedTransaction(transaction: ConfirmedTransaction | FailedTransaction): transaction is FailedTransaction;
export interface BcpQueryTag {
    readonly key: string;
    readonly value: string;
}
export interface BcpTxQuery {
    readonly id?: TransactionId;
    /** send transaction to or from this address */
    readonly sentFromOrTo?: Address;
    /** chain-specific key value pairs that encode a query */
    readonly tags?: ReadonlyArray<BcpQueryTag>;
    readonly height?: number;
    readonly minHeight?: number;
    readonly maxHeight?: number;
}
export interface BcpAddressQuery {
    readonly address: Address;
}
export interface BcpPubkeyQuery {
    readonly pubkey: PublicKeyBundle;
}
export declare type BcpAccountQuery = BcpAddressQuery | BcpPubkeyQuery;
export declare function isAddressQuery(query: BcpAccountQuery): query is BcpAddressQuery;
export declare function isPubkeyQuery(query: BcpAccountQuery): query is BcpPubkeyQuery;
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
    readonly getTicker: (ticker: TokenTicker) => Promise<BcpTicker | undefined>;
    readonly getAllTickers: () => Promise<ReadonlyArray<BcpTicker>>;
    /**
     * Get the current account information (e.g. balance)
     *
     * If an account is not found on the blockchain, this returns undefined.
     */
    readonly getAccount: (query: BcpAccountQuery) => Promise<BcpAccount | undefined>;
    readonly watchAccount: (account: BcpAccountQuery) => Stream<BcpAccount | undefined>;
    /**
     * Get a nonce for the next transaction signature.
     *
     * Implementation defines a default value if blockchain does not provide a nonce.
     */
    readonly getNonce: (query: BcpAddressQuery | BcpPubkeyQuery) => Promise<Nonce>;
    /**
     * Get multiple nonces at once to sign multiple transactions
     *
     * This avoids querying the blockchain for every nonce and removes the need to
     * wait for blocks before getting updated nonces.
     */
    readonly getNonces: (query: BcpAddressQuery | BcpPubkeyQuery, count: number) => Promise<ReadonlyArray<Nonce>>;
    readonly getBlockHeader: (height: number) => Promise<BlockHeader>;
    readonly watchBlockHeaders: () => Stream<BlockHeader>;
    /** @deprecated use watchBlockHeaders().map(header => header.height) */
    readonly changeBlock: () => Stream<number>;
    readonly postTx: (tx: PostableBytes) => Promise<PostTxResponse>;
    /**
     * Looks up transaction in history and if not found, waits until it is available.
     *
     * As a consequence, this never resolves for non-existing transaction IDs.
     */
    readonly waitForTransaction?: (id: TransactionId) => Promise<ConfirmedTransaction | FailedTransaction>;
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
