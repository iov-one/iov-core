import { Stream } from "xstream";
import { Account, AccountQuery, AddressQuery, Amount, AtomicSwap, AtomicSwapConnection, AtomicSwapQuery, BlockHeader, ChainId, ConfirmedTransaction, FailedTransaction, Fee, Nonce, PostableBytes, PostTxResponse, PubkeyQuery, Token, TokenTicker, TransactionQuery, UnsignedTransaction } from "@iov/bcp";
import { BnsUsernameNft, BnsUsernamesQuery, Result } from "./types";
/**
 * Talks directly to the BNS blockchain and exposes the
 * same interface we have with the BCP protocol.
 *
 * We can embed in iov-core process or use this in a BCP-relay
 */
export declare class BnsConnection implements AtomicSwapConnection {
    static establish(url: string): Promise<BnsConnection>;
    private static initialize;
    private readonly tmClient;
    private readonly codec;
    private readonly chainData;
    private readonly context;
    private tokensCache;
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
    postTx(tx: PostableBytes): Promise<PostTxResponse>;
    getToken(ticker: TokenTicker): Promise<Token | undefined>;
    getAllTokens(): Promise<ReadonlyArray<Token>>;
    getAccount(query: AccountQuery): Promise<Account | undefined>;
    getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce>;
    getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>>;
    /**
     * All matching swaps that are open (from app state)
     */
    getSwapsFromState(query: AtomicSwapQuery): Promise<ReadonlyArray<AtomicSwap>>;
    /**
     * All matching swaps that are open (in app state)
     *
     * To get claimed and returned, we need to look at the transactions.... TODO
     */
    getSwaps(query: AtomicSwapQuery): Promise<ReadonlyArray<AtomicSwap>>;
    /**
     * Emits currentState (getSwap) as a stream, then sends updates for any matching swap
     *
     * This includes an open swap beind claimed/aborted as well as a new matching swap being offered
     */
    watchSwaps(query: AtomicSwapQuery): Stream<AtomicSwap>;
    searchTx(query: TransactionQuery): Promise<ReadonlyArray<ConfirmedTransaction | FailedTransaction>>;
    /**
     * A stream of all transactions that match the tags from the present moment on
     */
    listenTx(query: TransactionQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    /**
     * Does a search and then subscribes to all future changes.
     *
     * It returns a stream starting the array of all existing transactions
     * and then continuing with live feeds
     */
    liveTx(query: TransactionQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    /**
     * Gets current balance and emits an update every time it changes
     */
    watchAccount(query: AccountQuery): Stream<Account | undefined>;
    getUsernames(query: BnsUsernamesQuery): Promise<ReadonlyArray<BnsUsernameNft>>;
    getFeeQuote(transaction: UnsignedTransaction): Promise<Fee>;
    withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T>;
    protected query(path: string, data: Uint8Array): Promise<QueryResponse>;
    protected updateEscrowBalance<T extends AtomicSwap>(escrow: T): Promise<T>;
    /**
     * Queries the blockchain for the enforced anti-spam fee
     */
    protected getDefaultFee(): Promise<Amount>;
    /**
     * Queries the blockchain for the enforced product fee for this kind of transaction.
     * Returns undefined if no product fee is defined
     */
    protected getProductFee(kind: string): Promise<Amount | undefined>;
}
export interface QueryResponse {
    readonly height?: number;
    readonly results: ReadonlyArray<Result>;
}
