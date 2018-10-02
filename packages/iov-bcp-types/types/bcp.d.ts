import { Stream } from "xstream";
import { ChainId, PostableBytes, PublicKeyBundle, Tag, TxId, TxQuery } from "@iov/tendermint-types";
import { Address, SignedTransaction } from "./signables";
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
    readonly publicKey: PublicKeyBundle;
    readonly nonce: Nonce;
}
export interface BcpTicker {
    readonly tokenTicker: TokenTicker;
    readonly sigFigs: number;
    readonly tokenName: string;
}
export interface BcpTransactionResponse {
    readonly metadata: {
        readonly status: boolean;
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
    readonly txid: TxId;
    readonly result: Uint8Array;
    readonly log: string;
}
export interface BcpAddressQuery {
    readonly address: Address;
}
export interface BcpValueNameQuery {
    readonly name: string;
}
export declare type BcpAccountQuery = BcpAddressQuery | BcpValueNameQuery;
export declare function isAddressQuery(query: BcpAccountQuery): query is BcpAddressQuery;
export interface BcpConnection {
    readonly disconnect: () => void;
    readonly chainId: () => ChainId;
    readonly height: () => Promise<number>;
    readonly changeBlock: () => Stream<number>;
    readonly postTx: (tx: PostableBytes) => Promise<BcpTransactionResponse>;
    readonly getTicker: (ticker: TokenTicker) => Promise<BcpQueryEnvelope<BcpTicker>>;
    readonly getAllTickers: () => Promise<BcpQueryEnvelope<BcpTicker>>;
    readonly getAccount: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpAccount>>;
    readonly getNonce: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpNonce>>;
    readonly watchAccount: (account: BcpAccountQuery) => Stream<BcpAccount | undefined>;
    readonly watchNonce: (account: BcpAccountQuery) => Stream<BcpNonce | undefined>;
    readonly searchTx: (query: TxQuery) => Promise<ReadonlyArray<ConfirmedTransaction>>;
    readonly listenTx: (tags: ReadonlyArray<Tag>) => Stream<ConfirmedTransaction>;
    readonly liveTx: (txQuery: TxQuery) => Stream<ConfirmedTransaction>;
}
