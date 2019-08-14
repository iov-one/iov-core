import {
  Account,
  AccountQuery,
  Address,
  AddressQuery,
  Amount,
  AtomicSwap,
  AtomicSwapConnection,
  AtomicSwapQuery,
  BlockHeader,
  ChainId,
  ConfirmedAndSignedTransaction,
  ConfirmedTransaction,
  FailedTransaction,
  Fee,
  LightTransaction,
  Nonce,
  PostableBytes,
  PostTxResponse,
  PubkeyQuery,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  UnsignedTransaction,
} from "@iov/bcp";
import { Stream } from "xstream";
import {
  BnsTx,
  BnsUsernameNft,
  BnsUsernamesQuery,
  ElectionRule,
  Electorate,
  Proposal,
  Result,
  Validator,
  Vote,
} from "./types";
export interface QueryResponse {
  readonly height?: number;
  readonly results: readonly Result[];
}
/**
 * Talks directly to the BNS blockchain and exposes the
 * same interface we have with the BCP protocol.
 *
 * We can embed in iov-core process or use this in a BCP-relay
 */
export declare class BnsConnection implements AtomicSwapConnection {
  static establish(url: string): Promise<BnsConnection>;
  private static initialize;
  private readonly tmClient;
  private readonly codec;
  private readonly chainData;
  private readonly context;
  private tokensCache;
  private readonly prefix;
  /**
   * Private constructor to hide package private types from the public interface
   *
   * Use BnsConnection.establish to get a BnsConnection.
   */
  private constructor();
  disconnect(): void;
  /**
   * The chain ID this connection is connected to
   *
   * We store this info from the initialization, no need to query every time
   */
  chainId(): ChainId;
  height(): Promise<number>;
  postTx(tx: PostableBytes): Promise<PostTxResponse>;
  getToken(ticker: TokenTicker): Promise<Token | undefined>;
  getAllTokens(): Promise<readonly Token[]>;
  getAccount(query: AccountQuery): Promise<Account | undefined>;
  getNonce(query: AddressQuery | PubkeyQuery): Promise<Nonce>;
  getNonces(query: AddressQuery | PubkeyQuery, count: number): Promise<readonly Nonce[]>;
  /**
   * All matching swaps that are open (from app state)
   */
  getSwapsFromState(query: AtomicSwapQuery): Promise<readonly AtomicSwap[]>;
  /**
   * All matching swaps that are open (in app state)
   *
   * To get claimed and returned, we need to look at the transactions.... TODO
   */
  getSwaps(query: AtomicSwapQuery): Promise<readonly AtomicSwap[]>;
  /**
   * Emits currentState (getSwap) as a stream, then sends updates for any matching swap
   *
   * This includes an open swap beind claimed/aborted as well as a new matching swap being offered
   */
  watchSwaps(query: AtomicSwapQuery): Stream<AtomicSwap>;
  getTx(id: TransactionId): Promise<ConfirmedAndSignedTransaction<UnsignedTransaction> | FailedTransaction>;
  searchTx(
    query: TransactionQuery,
  ): Promise<readonly (ConfirmedTransaction<LightTransaction> | FailedTransaction)[]>;
  /**
   * A stream of all transactions that match the tags from the present moment on
   */
  listenTx(query: TransactionQuery): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction>;
  /**
   * Does a search and then subscribes to all future changes.
   *
   * It returns a stream starting the array of all existing transactions
   * and then continuing with live feeds
   */
  liveTx(query: TransactionQuery): Stream<ConfirmedTransaction<LightTransaction> | FailedTransaction>;
  getBlockHeader(height: number): Promise<BlockHeader>;
  watchBlockHeaders(): Stream<BlockHeader>;
  /**
   * Gets current balance and emits an update every time it changes
   */
  watchAccount(query: AccountQuery): Stream<Account | undefined>;
  getValidators(): Promise<readonly Validator[]>;
  getElectorates(): Promise<readonly Electorate[]>;
  getElectionRules(): Promise<readonly ElectionRule[]>;
  getProposals(): Promise<readonly Proposal[]>;
  getVotes(voter: Address): Promise<readonly Vote[]>;
  getUsernames(query: BnsUsernamesQuery): Promise<readonly BnsUsernameNft[]>;
  getFeeQuote(transaction: UnsignedTransaction): Promise<Fee>;
  withDefaultFee<T extends UnsignedTransaction>(transaction: T): Promise<T>;
  protected query(path: string, data: Uint8Array): Promise<QueryResponse>;
  protected updateSwapAmounts<T extends AtomicSwap>(swap: T): Promise<T>;
  /**
   * Queries the blockchain for the enforced anti-spam fee
   */
  protected getDefaultFee(): Promise<Amount | undefined>;
  /**
   * Queries the blockchain for the enforced product fee for this kind of transaction.
   * Returns undefined if no product fee is defined
   */
  protected getProductFee(transaction: BnsTx): Promise<Amount | undefined>;
  /**
   * The same as searchTx but with ConfirmedTransaction<UnsignedTransaction> instead of
   * ConfirmedTransaction<LightTransaction>
   */
  private searchTxUnsigned;
  /**
   * The same as listenTx but with ConfirmedTransaction<UnsignedTransaction> instead of
   * ConfirmedTransaction<LightTransaction>
   */
  private listenTxUnsigned;
  /**
   * The same as liveTx but with ConfirmedTransaction<UnsignedTransaction> instead of
   * ConfirmedTransaction<LightTransaction>
   */
  private liveTxUnsigned;
}
