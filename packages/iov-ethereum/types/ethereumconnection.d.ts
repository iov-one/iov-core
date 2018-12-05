import { Stream } from "xstream";
import { ChainId, PostableBytes } from "@iov/base-types";
import { BcpAccount, BcpAccountQuery, BcpAddressQuery, BcpConnection, BcpPubkeyQuery, BcpQueryEnvelope, BcpTicker, BcpTransactionResponse, BcpTxQuery, ConfirmedTransaction, Nonce, TokenTicker } from "@iov/bcp-types";
import { Header } from "./responses";
export declare class EthereumConnection implements BcpConnection {
    static establish(baseUrl: string): Promise<EthereumConnection>;
    private readonly baseUrl;
    private readonly myChainId;
    constructor(baseUrl: string, chainId: ChainId);
    disconnect(): void;
    chainId(): ChainId;
    height(): Promise<number>;
    postTx(bytes: PostableBytes): Promise<BcpTransactionResponse>;
    getTicker(_: TokenTicker): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAllTickers(): Promise<BcpQueryEnvelope<BcpTicker>>;
    getAccount(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpAccount>>;
    getNonce(query: BcpAddressQuery | BcpPubkeyQuery): Promise<BcpQueryEnvelope<Nonce>>;
    getHeader(height: number): Promise<Header>;
    changeBlock(): Stream<number>;
    watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined>;
    watchNonce(_: BcpAddressQuery | BcpPubkeyQuery): Stream<Nonce | undefined>;
    searchTx(query: BcpTxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: BcpTxQuery): Stream<ConfirmedTransaction>;
    liveTx(_: BcpTxQuery): Stream<ConfirmedTransaction>;
}
