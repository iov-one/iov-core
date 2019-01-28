import { Stream } from "xstream";
import { Account, AccountQuery, AddressQuery, BcpConnection, BcpTicker, BcpTxQuery, BlockHeader, ChainId, ConfirmedTransaction, FailedTransaction, Nonce, PostableBytes, PostTxResponse, PubkeyQuery, TokenTicker } from "@iov/bcp-types";
/**
 * Encodes the current date and time as a nonce
 */
export declare function generateNonce(): Nonce;
export declare class LiskConnection implements BcpConnection {
    static establish(baseUrl: string): Promise<LiskConnection>;
    private readonly baseUrl;
    private readonly myChainId;
    constructor(baseUrl: string, chainId: ChainId);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    postTx(bytes: PostableBytes): Promise<PostTxResponse>;
    getTicker(searchTicker: TokenTicker): Promise<BcpTicker | undefined>;
    getAllTickers(): Promise<ReadonlyArray<BcpTicker>>;
    getAccount(query: AccountQuery): Promise<Account | undefined>;
    getNonce(_: AddressQuery | PubkeyQuery): Promise<Nonce>;
    getNonces(_: AddressQuery | PubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>>;
    watchAccount(query: AccountQuery): Stream<Account | undefined>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    liveTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    private waitForTransaction;
    private searchTransactions;
}
