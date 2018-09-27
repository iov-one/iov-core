import { Stream } from "xstream";
import { Address, BcpAccount, BcpAccountQuery, BcpAtomicSwap, BcpAtomicSwapConnection, BcpNonce, BcpQueryEnvelope, BcpSwapQuery, BcpTicker, BcpTransactionResponse, ConfirmedTransaction, TokenTicker, TxReadCodec } from "@iov/bcp-types";
import { Client as TendermintClient, StatusResponse } from "@iov/tendermint-rpc";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";
import { InitData } from "./normalize";
import { Result } from "./types";
export declare class Client implements BcpAtomicSwapConnection {
    static swapQueryTags(query: BcpSwapQuery, set?: boolean): Tag;
    static connect(url: string): Promise<Client>;
    protected static initialize(tmClient: TendermintClient): Promise<InitData>;
    protected readonly tmClient: TendermintClient;
    protected readonly codec: TxReadCodec;
    protected readonly initData: InitData;
    constructor(tmClient: TendermintClient, codec: TxReadCodec, initData: InitData);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    status(): Promise<StatusResponse>;
    postTx(tx: PostableBytes): Promise<BcpTransactionResponse>;
    getTicker(ticker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>>;
    getSwapFromState(query: BcpSwapQuery): Promise<BcpQueryEnvelope<BcpAtomicSwap>>;
    getSwap(query: BcpSwapQuery): Promise<BcpQueryEnvelope<BcpAtomicSwap>>;
    watchSwap(query: BcpSwapQuery): Stream<BcpAtomicSwap>;
    searchTx(txQuery: TxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(tags: ReadonlyArray<Tag>): Stream<ConfirmedTransaction>;
    liveTx(txQuery: TxQuery): Stream<ConfirmedTransaction>;
    changeBlock(): Stream<number>;
    changeTx(tags: ReadonlyArray<Tag>): Stream<number>;
    changeBalance(addr: Address): Stream<number>;
    changeNonce(addr: Address): Stream<number>;
    watchAccount(account: BcpAccountQuery): Stream<BcpAccount | undefined>;
    watchNonce(account: BcpAccountQuery): Stream<BcpNonce | undefined>;
    protected query(path: string, data: Uint8Array): Promise<QueryResponse>;
}
export interface QueryResponse {
    readonly height?: number;
    readonly results: ReadonlyArray<Result>;
}
