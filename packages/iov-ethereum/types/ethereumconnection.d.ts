import { Stream } from "xstream";
import { BcpAccount, BcpAccountQuery, BcpAddressQuery, BcpConnection, BcpPubkeyQuery, BcpQueryEnvelope, BcpTicker, BcpTxQuery, BlockHeader, ChainId, ConfirmedTransaction, Nonce, PostableBytes, PostTxResponse, TokenTicker } from "@iov/bcp-types";
export interface EthereumConnectionOptions {
    readonly wsUrl?: string;
}
export declare class EthereumConnection implements BcpConnection {
    static establish(baseUrl: string, options?: EthereumConnectionOptions): Promise<EthereumConnection>;
    private readonly baseUrl;
    private readonly myChainId;
    private readonly socket;
    constructor(baseUrl: string, chainId: ChainId, options?: EthereumConnectionOptions);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    postTx(bytes: PostableBytes): Promise<PostTxResponse>;
    getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(query: BcpAddressQuery | BcpPubkeyQuery): Promise<Nonce>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    /** @deprecated use watchBlockHeaders().map(header => header.height) */
    changeBlock(): Stream<number>;
    watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined>;
    watchNonce(_: BcpAddressQuery | BcpPubkeyQuery): Stream<Nonce>;
    searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: BcpTxQuery): Stream<ConfirmedTransaction>;
    liveTx(_: BcpTxQuery): Stream<ConfirmedTransaction>;
    private socketSend;
}
