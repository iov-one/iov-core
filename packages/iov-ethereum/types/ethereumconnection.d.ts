import { Stream } from "xstream";
import { Account, AccountQuery, AddressQuery, BcpConnection, BcpTicker, BcpTxQuery, BlockHeader, ChainId, ConfirmedTransaction, FailedTransaction, Fee, Nonce, PostableBytes, PostTxResponse, PubkeyQuery, TokenTicker, UnsignedTransaction } from "@iov/bcp";
export interface EthereumConnectionOptions {
    readonly wsUrl?: string;
    /** URL to an Etherscan compatible scraper API */
    readonly scraperApiUrl?: string;
}
export declare class EthereumConnection implements BcpConnection {
    static establish(baseUrl: string, options?: EthereumConnectionOptions): Promise<EthereumConnection>;
    private readonly rpcClient;
    private readonly myChainId;
    private readonly socket;
    private readonly scraperApiUrl;
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
    getFeeQuote(_: UnsignedTransaction): Promise<Fee>;
    private socketSend;
    private searchTransactionsById;
    private searchSendTransactionsByAddress;
}
