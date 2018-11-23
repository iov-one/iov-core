import { Stream } from "xstream";
import { ChainId, PostableBytes, PublicKeyBundle, TxId } from "@iov/base-types";
import { Address, SignedTransaction, TxCodec } from "./signables";
import { Nonce, TokenTicker, UnsignedTransaction } from "./transactions";
export interface BcpQueryEnvelope<T> {
    readonly metadata: BcpQueryMetadata;
    readonly data: ReadonlyArray<T>;
}
export declare function dummyEnvelope<T>(data: ReadonlyArray<T>): BcpQueryEnvelope<T>;
export interface BcpQueryMetadata {
    readonly offset: number;
    readonly limit: number;
}
export interface BcpAccount {
    readonly address: Address;
    readonly name?: string;
    readonly balance: ReadonlyArray<BcpCoin>;
}
export interface BcpCoin extends BcpTicker {
    readonly whole: number;
    readonly fractional: number;
}
export interface BcpNonce {
    readonly address: Address;
    readonly pubkey: PublicKeyBundle;
    readonly nonce: Nonce;
}
export interface BcpTicker {
    readonly tokenTicker: TokenTicker;
    readonly sigFigs: number;
    /**
     * A name to be displayed to the user which allows differentiation
     * of multiple tokens that use the same ticker.
     *
     * For example "Holo (HOT)" and "Hydro Protocol (HOT)" get the token
     * names and "Holo" and "Hydro Protocol".
     */
    readonly tokenName: string;
}
export interface BcpTransactionResponse {
    readonly metadata: {
        readonly height?: number;
    };
    readonly data: {
        readonly message: string;
        readonly txid: TxId;
        readonly result: Uint8Array;
    };
}
export interface ConfirmedTransaction<T extends UnsignedTransaction = UnsignedTransaction> extends SignedTransaction<T> {
    readonly height: number;
    /** depth of the transaction's block, starting at 1 as soon as transaction is in a block */
    readonly confirmations: number;
    readonly txid: TxId;
    /** Data from executing tx (result, code, tags...) */
    readonly result?: Uint8Array;
    readonly log?: string;
}
export interface BcpQueryTag {
    readonly key: string;
    readonly value: string;
}
export interface BcpTxQuery {
    readonly tags: ReadonlyArray<BcpQueryTag>;
    readonly hash?: TxId;
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
export interface BcpConnection {
    readonly disconnect: () => void;
    readonly chainId: () => ChainId;
    readonly height: () => Promise<number>;
    readonly changeBlock: () => Stream<number>;
    readonly postTx: (tx: PostableBytes) => Promise<BcpTransactionResponse>;
    readonly getTicker: (ticker: TokenTicker) => Promise<BcpQueryEnvelope<BcpTicker>>;
    readonly getAllTickers: () => Promise<BcpQueryEnvelope<BcpTicker>>;
    /**
     * Get the current account information (e.g. balance)
     *
     * If an account is not found on the blockchain, an envelope with an empty data array is returned
     */
    readonly getAccount: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpAccount>>;
    readonly getNonce: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpNonce>>;
    readonly watchAccount: (account: BcpAccountQuery) => Stream<BcpAccount | undefined>;
    readonly watchNonce: (account: BcpAccountQuery) => Stream<BcpNonce | undefined>;
    readonly searchTx: (query: BcpTxQuery) => Promise<ReadonlyArray<ConfirmedTransaction>>;
    readonly listenTx: (tags: ReadonlyArray<BcpQueryTag>) => Stream<ConfirmedTransaction>;
    readonly liveTx: (txQuery: BcpTxQuery) => Stream<ConfirmedTransaction>;
}
export interface ChainConnector {
    readonly client: () => Promise<BcpConnection>;
    readonly codec: TxCodec;
    readonly expectedChainId?: ChainId;
}
