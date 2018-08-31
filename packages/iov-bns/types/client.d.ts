import { Stream } from "xstream";
import { Address, BcpAccount, BcpAccountQuery, BcpNonce, BcpQueryEnvelope, BcpTicker, BcpTransactionResponse, ConfirmedTransaction, IovReader, TokenTicker, TxReadCodec } from "@iov/bcp-types";
import { Client as TendermintClient, StatusResponse } from "@iov/tendermint-rpc";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";
import { InitData } from "./normalize";
import { Result } from "./types";
export declare class Client implements IovReader {
    static fromOrToTag(addr: Address): Tag;
    static nonceTag(addr: Address): Tag;
    static connect(url: string): Promise<Client>;
    protected readonly tmClient: TendermintClient;
    protected readonly codec: TxReadCodec;
    protected readonly initData: Promise<InitData>;
    constructor(tmClient: TendermintClient, codec: TxReadCodec);
    disconnect(): void;
    chainId(): Promise<ChainId>;
    height(): Promise<number>;
    status(): Promise<StatusResponse>;
    postTx(tx: PostableBytes): Promise<BcpTransactionResponse>;
    getTicker(ticker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>>;
    searchTx(txQuery: TxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(tags: ReadonlyArray<Tag>): Stream<ConfirmedTransaction>;
    liveTx(txQuery: TxQuery): Stream<ConfirmedTransaction>;
    changeFeed(tags: ReadonlyArray<Tag>): Stream<number>;
    changeBalance(addr: Address): Stream<number>;
    changeNonce(addr: Address): Stream<number>;
    watchAccount(account: BcpAccountQuery): Stream<BcpAccount | undefined>;
    protected initialize(): Promise<InitData>;
    protected query(path: string, data: Uint8Array): Promise<QueryResponse>;
}
export interface QueryResponse {
    readonly height?: number;
    readonly results: ReadonlyArray<Result>;
}
