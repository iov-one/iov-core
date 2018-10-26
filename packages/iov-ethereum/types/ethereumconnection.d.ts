import { Stream } from "xstream";
import { BcpAccount, BcpAccountQuery, BcpConnection, BcpNonce, BcpQueryEnvelope, BcpTicker, BcpTransactionResponse, ConfirmedTransaction, TokenTicker } from "@iov/bcp-types";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";
export declare class EthereumConnection implements BcpConnection {
    static establish(baseUrl: string): Promise<EthereumConnection>;
    private readonly baseUrl;
    private readonly myChainId;
    constructor(baseUrl: string, chainId: ChainId);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    postTx(_: PostableBytes): Promise<BcpTransactionResponse>;
    getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>>;
    changeBlock(): Stream<number>;
    watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined>;
    watchNonce(_: BcpAccountQuery): Stream<BcpNonce | undefined>;
    searchTx(_: TxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: ReadonlyArray<Tag>): Stream<ConfirmedTransaction>;
    liveTx(_: TxQuery): Stream<ConfirmedTransaction>;
}
