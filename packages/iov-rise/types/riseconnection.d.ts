import { Stream } from "xstream";
import { BcpAccount, BcpAccountQuery, BcpConnection, BcpNonce, BcpQueryEnvelope, BcpQueryTag, BcpTicker, BcpTransactionResponse, BcpTxQuery, ConfirmedTransaction, Nonce, TokenTicker } from "@iov/bcp-types";
import { ChainId, PostableBytes } from "@iov/tendermint-types";
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
    postTx(bytes: PostableBytes): Promise<BcpTransactionResponse>;
    getTicker(searchTicker: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>>;
    changeBlock(): Stream<number>;
    watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined>;
    watchNonce(_: BcpAccountQuery): Stream<BcpNonce | undefined>;
    searchTx(_: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: ReadonlyArray<BcpQueryTag>): Stream<ConfirmedTransaction>;
    liveTx(_: BcpTxQuery): Stream<ConfirmedTransaction>;
}
