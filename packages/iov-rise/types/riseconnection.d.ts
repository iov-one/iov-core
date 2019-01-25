import { Stream } from "xstream";
import { BcpAccount, BcpAccountQuery, BcpAddressQuery, BcpConnection, BcpPubkeyQuery, BcpTicker, BcpTxQuery, BlockHeader, ChainId, ConfirmedTransaction, FailedTransaction, Nonce, PostableBytes, PostTxResponse, TokenTicker } from "@iov/bcp-types";
/**
 * Encodes the current date and time as a nonce
 */
export declare function generateNonce(): Nonce;
export declare class RiseConnection implements BcpConnection {
    static establish(baseUrl: string): Promise<RiseConnection>;
    private readonly baseUrl;
    private readonly myChainId;
    constructor(baseUrl: string, chainId: ChainId);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    postTx(bytes: PostableBytes): Promise<PostTxResponse>;
    getTicker(searchTicker: TokenTicker): Promise<BcpTicker | undefined>;
    getAllTickers(): Promise<ReadonlyArray<BcpTicker>>;
    getAccount(query: BcpAccountQuery): Promise<BcpAccount | undefined>;
    getNonce(_: BcpAddressQuery | BcpPubkeyQuery): Promise<Nonce>;
    getNonces(_: BcpAddressQuery | BcpPubkeyQuery, count: number): Promise<ReadonlyArray<Nonce>>;
    watchAccount(query: BcpAccountQuery): Stream<BcpAccount | undefined>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    /** @deprecated use watchBlockHeaders().map(header => header.height) */
    changeBlock(): Stream<number>;
    searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    liveTx(query: BcpTxQuery): Stream<ConfirmedTransaction | FailedTransaction>;
    private searchSingleTransaction;
    private waitForTransaction;
    private searchTransactions;
}
