import { Stream } from "xstream";
import { Account, AccountQuery, Address, AddressQuery, BcpAtomicSwap, BcpAtomicSwapConnection, BcpQueryEnvelope, BcpSwapQuery, BcpTicker, BcpTxQuery, BlockHeader, ChainId, ConfirmedTransaction, FailedTransaction, Nonce, PostableBytes, PostTxResponse, PubkeyQuery, TokenTicker } from "@iov/bcp-types";
import { StatusResponse } from "@iov/tendermint-rpc";
import { BnsBlockchainNft, BnsBlockchainsQuery, BnsUsernameNft, BnsUsernamesQuery, Result } from "./types";
/**
 * Talks directly to the BNS blockchain and exposes the
 * same interface we have with the BCP protocol.
 *
 * We can embed in iov-core process or use this in a BCP-relay
 */
export declare class BnsConnection implements BcpAtomicSwapConnection {
    static establish(url: string): Promise<BnsConnection>;
    private static initialize;
    private readonly tmClient;
    private readonly codec;
    private readonly chainData;
    private readonly context;
    /**
     * Private constructor to hide package private types from the public interface
     *
     * Use BnsConnection.establish to get a BnsConnection.
     */
    private constructor();
    disconnect(): void;
    /**
     * The chain ID this connection is connected to
     *
     * We store this info from the initialization, no need to query every time
     */
    chainId(): ChainId;
    height(): Promise<number>;
    status(): Promise<StatusResponse>;
    postTx(tx: PostableBytes): Promise<PostTxResponse>;
    getTicker(ticker: TokenTicker): Promise<BcpTicker | undefined>;
    getAllTickers(): Promise<ReadonlyArray<BcpTicker>>;
    getAccount(query: AccountQuery): Promise<Account | undefined>;
    getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce>;
    getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>>;
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
    searchTx(txQuery: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction | FailedTransaction>>;
    /**
     * A stream of all transactions that match the tags from the present moment on
     */
    listenTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    /**
     * Does a search and then subscribes to all future changes.
     *
     * It returns a stream starting the array of all existing transactions
     * and then continuing with live feeds
     */
    liveTx(txQuery: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    /**
     * Emits the blockheight for every block where a tx matching these tags is emitted
     */
    changeTx(query: BcpTxQuery): Stream<number>;
    /**
     * A helper that triggers if the balance ever changes
     */
    changeBalance(addr: Address): Stream<number>;
    /**
     * A helper that triggers if the nonce every changes
     */
    changeNonce(addr: Address): Stream<number>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    /** @deprecated use watchBlockHeaders().map(header => header.height) */
    changeBlock(): Stream<number>;
    /**
     * Gets current balance and emits an update every time it changes
     */
    watchAccount(query: AccountQuery): Stream<Account | undefined>;
    getBlockchains(query: BnsBlockchainsQuery): Promise<ReadonlyArray<BnsBlockchainNft>>;
    getUsernames(query: BnsUsernamesQuery): Promise<ReadonlyArray<BnsUsernameNft>>;
    protected query(path: string, data: Uint8Array): Promise<QueryResponse>;
}
export interface QueryResponse {
    readonly height?: number;
    readonly results: ReadonlyArray<Result>;
}
