import { ChainId, PostableBytes, PublicKeyBundle, TxQuery } from "@iov/tendermint-types";
import { Address, SignedTransaction } from "./signables";
import { Nonce, TokenTicker } from "./transactions";
export interface BcpQueryEnvelope<T extends BcpData> {
    readonly metadata: BcpQueryMetadata;
    readonly data: ReadonlyArray<T>;
}
export interface BcpQueryMetadata {
    readonly offset: number;
    readonly limit: number;
}
export declare type BcpData = BcpAccount | BcpNonce | BcpTicker;
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
    readonly tokenName?: string;
}
export interface BcpTransactionResponse {
    readonly metadata: {
        readonly status: boolean;
    };
    readonly data: {
        readonly message: string;
    };
}
export interface BcpAddressQuery {
    readonly address: Address;
}
export interface BcpValueNameQuery {
    readonly name: string;
}
export declare type BcpAccountQuery = BcpAddressQuery | BcpValueNameQuery;
export interface CoreReader {
    readonly postTx: (tx: PostableBytes) => Promise<BcpTransactionResponse>;
    readonly getTicker: (ticker: TokenTicker) => Promise<BcpQueryEnvelope<BcpTicker>>;
    readonly getAllTickers: () => Promise<BcpQueryEnvelope<BcpTicker>>;
    readonly getAccount: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpAccount>>;
    readonly getNonce: (account: BcpAccountQuery) => Promise<BcpQueryEnvelope<BcpNonce>>;
    readonly chainId: () => Promise<ChainId>;
    readonly height: () => Promise<number>;
    readonly searchTx: (query: TxQuery) => Promise<ReadonlyArray<ConfirmedTransaction>>;
}
export interface ConfirmedTransaction extends SignedTransaction {
    readonly height: number;
}
