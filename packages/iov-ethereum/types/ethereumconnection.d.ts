import { Stream } from "xstream";
import { Account, AccountQuery, AddressQuery, BcpConnection, BcpTicker, BcpTxQuery, BlockHeader, ChainId, ConfirmedTransaction, FailedTransaction, Fee, Nonce, PostableBytes, PostTxResponse, PubkeyQuery, TokenTicker, UnsignedTransaction } from "@iov/bcp";
import { Erc20Options } from "./erc20reader";
export interface EthereumConnectionOptions {
    readonly wsUrl?: string;
    /** URL to an Etherscan compatible scraper API */
    readonly scraperApiUrl?: string;
    /** List of supported ERC20 tokens */
    readonly erc20Tokens?: ReadonlyMap<TokenTicker, Erc20Options>;
    /** Time between two polls for block, transaction and account watching in seconds */
    readonly pollInterval?: number;
}
export declare class EthereumConnection implements BcpConnection {
    static establish(baseUrl: string, options?: EthereumConnectionOptions): Promise<EthereumConnection>;
    private readonly pollIntervalMs;
    private readonly rpcClient;
    private readonly myChainId;
    private readonly socket;
    private readonly scraperApiUrl;
    private readonly erc20Tokens;
    private readonly erc20ContractReaders;
    private readonly codec;
    constructor(baseUrl: string, chainId: ChainId, options?: EthereumConnectionOptions);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    postTx(bytes: PostableBytes): Promise<PostTxResponse>;
    getTicker(searchTicker: TokenTicker): Promise<BcpTicker | undefined>;
    getAllTickers(): Promise<ReadonlyArray<BcpTicker>>;
    getAccount(query: AccountQuery): Promise<Account | undefined>;
    getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce>;
    getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    watchAccount(query: AccountQuery): Stream<Account | undefined>;
    searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    liveTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    getFeeQuote(transaction: UnsignedTransaction): Promise<Fee>;
    private socketSend;
    private searchTransactionsById;
    /**
     * Merges search results from two different sources: scraper and logs.
     *
     * Those sources are not necessarily in sync, i.e. the a node's logs can contain
     * results from blocks that are not available in the scraper or vice versa.
     */
    private searchSendTransactionsByAddress;
    private searchSendTransactionsByAddressOnScraper;
    private searchSendTransactionsByAddressInLogs;
    /**
     * The return values of this helper function are unsorted.
     */
    private searchErc20Transfers;
}
