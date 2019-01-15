import { Stream } from "xstream";
import { BcpAccount, BcpAccountQuery, BcpAddressQuery, BcpConnection, BcpPubkeyQuery, BcpTicker, BcpTxQuery, BlockHeader, ChainId, ConfirmedTransaction, Nonce, PostableBytes, PostTxResponse, TokenTicker } from "@iov/bcp-types";
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
    getAccount(query: BcpAccountQuery): Promise<BcpAccount | undefined>;
    getNonce(query: BcpAddressQuery | BcpPubkeyQuery): Promise<Nonce>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    /** @deprecated use watchBlockHeaders().map(header => header.height) */
    changeBlock(): Stream<number>;
    watchAccount(query: BcpAccountQuery): Stream<BcpAccount | undefined>;
    searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(query: BcpTxQuery): Stream<ConfirmedTransaction>;
    liveTx(query: BcpTxQuery): Stream<ConfirmedTransaction>;
    private socketSend;
    private searchTransactionsById;
    private searchTransactionsByAddress;
}
