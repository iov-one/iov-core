import {
  Account,
  AccountQuery,
  Address,
  AddressQuery,
  AtomicSwap,
  AtomicSwapConnection,
  AtomicSwapQuery,
  BlockHeader,
  ChainId,
  ConfirmedAndSignedTransaction,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PubkeyQuery,
  SwapId,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  UnsignedTransaction,
} from "@iov/bcp";
import { Stream } from "xstream";
import { Erc20TokensMap } from "./erc20";
import { EthereumCodec } from "./ethereumcodec";
export interface EthereumLog {
  readonly transactionIndex: string;
  readonly data: string;
  readonly topics: readonly string[];
}
export interface EthereumConnectionOptions {
  /** URL to an Etherscan compatible scraper API */
  readonly scraperApiUrl?: string;
  /** Address of the deployed atomic swap contract for ETH */
  readonly atomicSwapEtherContractAddress?: Address;
  /** Address of the deployed atomic swap contract for ERC20 tokens */
  readonly atomicSwapErc20ContractAddress?: Address;
  /** List of supported ERC20 tokens */
  readonly erc20Tokens?: Erc20TokensMap;
  /** Time between two polls for block, transaction and account watching in seconds */
  readonly pollInterval?: number;
}
export declare class EthereumConnection implements AtomicSwapConnection {
  static createEtherSwapId(): Promise<SwapId>;
  static createErc20SwapId(): Promise<SwapId>;
  static establish(baseUrl: string, options: EthereumConnectionOptions): Promise<EthereumConnection>;
  private static parseOpenedEventBytes;
  private static parseClaimedEventBytes;
  private static parseAbortedEventBytes;
  private static updateSwapInList;
  readonly chainId: ChainId;
  readonly codec: EthereumCodec;
  private readonly pollIntervalMs;
  private readonly rpcClient;
  private readonly scraperApiUrl;
  private readonly atomicSwapEtherContractAddress?;
  private readonly atomicSwapErc20ContractAddress?;
  private readonly erc20Tokens;
  private readonly erc20ContractReaders;
  constructor(baseUrl: string, chainId: ChainId, options: EthereumConnectionOptions);
  disconnect(): void;
  height(): Promise<number>;
  postTx(bytes: PostableBytes): Promise<PostTxResponse>;
  getToken(searchTicker: TokenTicker): Promise<Token | undefined>;
  getAllTokens(): Promise<readonly Token[]>;
  getAccount(query: AccountQuery): Promise<Account | undefined>;
  getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce>;
  getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<readonly Nonce[]>;
  getBlockHeader(height: number): Promise<BlockHeader>;
  watchBlockHeaders(): Stream<BlockHeader>;
  watchAccount(query: AccountQuery): Stream<Account | undefined>;
  getTx(id: TransactionId): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction>>;
  searchTx(query: TransactionQuery): Promise<readonly ConfirmedTransaction<UnsignedTransaction>[]>;
  listenTx(query: TransactionQuery): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction>;
  liveTx(query: TransactionQuery): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction>;
  getFeeQuote(transaction: UnsignedTransaction): Promise<Fee>;
  withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T>;
  getSwaps(query: AtomicSwapQuery, minHeight?: number, maxHeight?: number): Promise<readonly AtomicSwap[]>;
  watchSwaps(_: AtomicSwapQuery): Stream<AtomicSwap>;
  private searchTransactionsById;
  /**
   * Merges search results from two different sources: scraper and logs.
   *
   * Those sources are not necessarily in sync, i.e. the a node's logs can contain
   * results from blocks that are not available in the scraper or vice versa.
   */
  private searchSendTransactionsByAddress;
  private searchSendTransactionsByAddressOnScraper;
  private searchSendTransactionsByAddressInLogs;
  /**
   * The return values of this helper function are unsorted.
   */
  private searchErc20Transfers;
  private getSwapsById;
  private getSwapsWithFilter;
  private getSwapLogs;
}
