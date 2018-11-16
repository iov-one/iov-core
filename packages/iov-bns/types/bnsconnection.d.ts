import { Stream } from "xstream";
import { ChainId, PostableBytes } from "@iov/base-types";
import { Address, BcpAccount, BcpAccountQuery, BcpAtomicSwap, BcpAtomicSwapConnection, BcpNonce, BcpQueryEnvelope, BcpQueryTag, BcpSwapQuery, BcpTicker, BcpTransactionResponse, BcpTxQuery, ConfirmedTransaction, TokenTicker, TxReadCodec } from "@iov/bcp-types";
import { Client as TendermintClient, StatusResponse } from "@iov/tendermint-rpc";
import { InitData } from "./normalize";
import { Result } from "./types";
/**
 * Talks directly to the BNS blockchain and exposes the
 * same interface we have with the BCP protocol.
 *
 * We can embed in iov-core process or use this in a BCP-relay
 */
export declare class BnsConnection implements BcpAtomicSwapConnection {
    static establish(url: string): Promise<BnsConnection>;
    protected static initialize(tmClient: TendermintClient): Promise<InitData>;
    protected readonly tmClient: TendermintClient;
    protected readonly codec: TxReadCodec;
    protected readonly initData: InitData;
    constructor(tmClient: TendermintClient, codec: TxReadCodec, initData: InitData);
    disconnect(): void;
    /**
     * The chain ID this connection is connected to
     *
     * We store this info from the initialization, no need to query every time
     */
    chainId(): ChainId;
    height(): Promise<number>;
    status(): Promise<StatusResponse>;
    postTx(tx: PostableBytes): Promise<BcpTransactionResponse>;
    getTicker(ticker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(account: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>>;
    /**
     * All matching swaps that are open (from app state)
     */
    getSwapFromState(query: BcpSwapQuery): Promise<BcpQueryEnvelope<BcpAtomicSwap>>;
    /**
     * All matching swaps that are open (in app state)
     *
     * To get claimed and returned, we need to look at the transactions.... TODO
     */
    getSwap(query: BcpSwapQuery): Promise<BcpQueryEnvelope<BcpAtomicSwap>>;
    /**
     * Emits currentState (getSwap) as a stream, then sends updates for any matching swap
     *
     * This includes an open swap beind claimed/expired as well as a new matching swap being offered
     */
    watchSwap(query: BcpSwapQuery): Stream<BcpAtomicSwap>;
    searchTx(txQuery: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    /**
     * A stream of all transactions that match the tags from the present moment on
     */
    listenTx(tags: ReadonlyArray<BcpQueryTag>): Stream<ConfirmedTransaction>;
    /**
     * Does a search and then subscribes to all future changes.
     *
     * It returns a stream starting the array of all existing transactions
     * and then continuing with live feeds
     */
    liveTx(txQuery: BcpTxQuery): Stream<ConfirmedTransaction>;
    changeBlock(): Stream<number>;
    /**
     * Emits the blockheight for every block where a tx matching these tags is emitted
     */
    changeTx(tags: ReadonlyArray<BcpQueryTag>): Stream<number>;
    /**
     * A helper that triggers if the balance ever changes
     */
    changeBalance(addr: Address): Stream<number>;
    /**
     * A helper that triggers if the nonce every changes
     */
    changeNonce(addr: Address): Stream<number>;
    /**
     * Gets current balance and emits an update every time it changes
     */
    watchAccount(account: BcpAccountQuery): Stream<BcpAccount | undefined>;
    /**
     * Gets current nonce and emits an update every time it changes
     */
    watchNonce(account: BcpAccountQuery): Stream<BcpNonce | undefined>;
    protected query(path: string, data: Uint8Array): Promise<QueryResponse>;
}
export interface QueryResponse {
    readonly height?: number;
    readonly results: ReadonlyArray<Result>;
}
