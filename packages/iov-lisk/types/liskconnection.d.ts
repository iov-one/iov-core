import { Stream } from "xstream";
import { ChainId, PostableBytes } from "@iov/base-types";
import { BcpAccount, BcpAccountQuery, BcpAddressQuery, BcpConnection, BcpPubkeyQuery, BcpQueryEnvelope, BcpTicker, BcpTxQuery, BlockHeader, ConfirmedTransaction, Nonce, PostTxResponse, TokenTicker } from "@iov/bcp-types";
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
    getTicker(searchTicker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(_: BcpAddressQuery | BcpPubkeyQuery): Promise<BcpQueryEnvelope<Nonce>>;
    watchAccount(query: BcpAccountQuery): Stream<BcpAccount | undefined>;
    watchNonce(_: BcpAddressQuery | BcpPubkeyQuery): Stream<Nonce | undefined>;
    getBlockHeader(height: number): Promise<BlockHeader>;
    watchBlockHeaders(): Stream<BlockHeader>;
    /** @deprecated use watchBlockHeaders().map(header => header.height) */
    changeBlock(): Stream<number>;
    searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: BcpTxQuery): Stream<ConfirmedTransaction>;
    liveTx(query: BcpTxQuery): Stream<ConfirmedTransaction>;
    private searchTransactions;
}
