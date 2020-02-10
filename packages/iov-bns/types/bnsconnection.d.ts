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
  Nonce,
  PostableBytes,
  PostTxResponse,
  PubkeyQuery,
  Token,
  TokenTicker,
  TransactionId,
  TransactionQuery,
  TxReadCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { Stream } from "xstream";
import {
  BnsTermDepositContractNft,
  BnsTermDepositNft,
  BnsTx,
  BnsUsernameNft,
  BnsUsernamesQuery,
  DepositContractIdBytes,
  ElectionRule,
  Electorate,
  Proposal,
  Result,
  TxFeeConfiguration,
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
  readonly chainId: ChainId;
  readonly codec: TxReadCodec;
  private readonly tmClient;
  private readonly context;
  private tokensCache;
  private get prefix();
  /**
   * Private constructor to hide package private types from the public interface
   *
   * Use BnsConnection.establish to get a BnsConnection.
   */
  private constructor();
  disconnect(): void;
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
  ): Promise<readonly (ConfirmedAndSignedTransaction<UnsignedTransaction> | FailedTransaction)[]>;
  /**
   * A stream of all transactions that match the tags from the present moment on
   */
  listenTx(query: TransactionQuery): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction>;
  /**
   * Does a search and then subscribes to all future changes.
   *
   * It returns a stream starting the array of all existing transactions
   * and then continuing with live feeds
   */
  liveTx(query: TransactionQuery): Stream<ConfirmedTransaction<UnsignedTransaction> | FailedTransaction>;
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
  getDeposits(depositor: Address): Promise<readonly BnsTermDepositNft[]>;
  getContracts(depositContractId?: DepositContractIdBytes): Promise<readonly BnsTermDepositContractNft[]>;
  getUsernames(query: BnsUsernamesQuery): Promise<readonly BnsUsernameNft[]>;
  estimateTxSize(transaction: UnsignedTransaction, numberOfSignatures: number, nonce?: Nonce): number;
  getTxFeeConfiguration(): Promise<TxFeeConfiguration | undefined>;
  getFeeQuote(transaction: UnsignedTransaction, numberOfSignatures?: number, nonce?: Nonce): Promise<Fee>;
  withDefaultFee<T extends UnsignedTransaction>(transaction: T, payer?: Address): Promise<T>;
  protected query(path: string, data: Uint8Array): Promise<QueryResponse>;
  protected updateSwapAmounts<T extends AtomicSwap>(swap: T): Promise<T>;
  /**
   * Queries the blockchain for the enforced anti-spam fee
   */
  protected getDefaultFee(): Promise<Amount | undefined>;
  protected getSizeFee(
    tx: UnsignedTransaction,
    numberOfSignatures: number,
    nonce?: Nonce,
  ): Promise<Amount | undefined>;
  /**
   * Queries the blockchain for the enforced product fee for this kind of transaction.
   * Returns undefined if no product fee is defined
   */
  protected getProductFee(transaction: BnsTx): Promise<Amount | undefined>;
}
