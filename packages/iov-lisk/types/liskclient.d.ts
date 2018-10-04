import { Stream } from "xstream";
import { Address, BcpAccount, BcpAccountQuery, BcpConnection, BcpNonce, BcpQueryEnvelope, BcpTicker, BcpTransactionResponse, ConfirmedTransaction, Nonce, TokenTicker } from "@iov/bcp-types";
import { ChainId, PostableBytes, Tag, TxQuery } from "@iov/tendermint-types";
/**
 * Encodes the current date and time as a nonce
 */
export declare function generateNonce(): Nonce;
export declare class LiskConnection implements BcpConnection {
    static connect(baseUrl: string): Promise<LiskConnection>;
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
    getNonce(query: BcpAccountQuery): Promise<BcpQueryEnvelope<BcpNonce>>;
    changeBalance(_: Address): Stream<number>;
    changeNonce(_: Address): Stream<number>;
    changeBlock(): Stream<number>;
    watchAccount(_: BcpAccountQuery): Stream<BcpAccount | undefined>;
    watchNonce(_: BcpAccountQuery): Stream<BcpNonce | undefined>;
    searchTx(_: TxQuery): Promise<ReadonlyArray<ConfirmedTransaction>>;
    listenTx(_: ReadonlyArray<Tag>): Stream<ConfirmedTransaction>;
    liveTx(_: TxQuery): Stream<ConfirmedTransaction>;
}
