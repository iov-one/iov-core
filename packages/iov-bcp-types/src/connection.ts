import { ReadonlyDate } from "readonly-date";
import { As } from "type-tagger";
import { Stream } from "xstream";

import { ValueAndUpdates } from "@iov/stream";

import { PostableBytes } from "./codec";
import {
  Address,
  Amount,
  ChainId,
  Nonce,
  PublicKeyBundle,
  SignedTransaction,
  TokenTicker,
  TransactionId,
  UnsignedTransaction,
} from "./transactions";

/*
Types defined to match
https://app.swaggerhub.com/apis/IOV.one/BOV/0.0.4#/basic/getAccounts
Only a subset currently implemented.
*/

export interface BcpQueryEnvelope<T> {
  readonly metadata: BcpQueryMetadata;
  readonly data: ReadonlyArray<T>;
}

// dummyEnvelope just adds some plausible metadata to make bcp happy
export function dummyEnvelope<T>(data: ReadonlyArray<T>): BcpQueryEnvelope<T> {
  return {
    metadata: {
      offset: 0,
      limit: 100,
    },
    data: data,
  };
}

export interface BcpQueryMetadata {
  readonly offset: number;
  readonly limit: number;
}

export interface BcpCoin extends BcpTicker, Amount {}

export interface BcpAccount {
  readonly address: Address;
  /**
   * The public key, if available.
   *
   * - Always available if the full pubkey is encoded in the address (e.g. nano, Substrate/Polkadot)
   * - Available after first transaction sent (e.g. Lisk, Tendermint, Ethereum)
   */
  readonly pubkey?: PublicKeyBundle;
  readonly name?: string;
  readonly balance: ReadonlyArray<BcpCoin>;
}

export interface BcpTicker {
  readonly tokenTicker: TokenTicker;
  /**
   * A name to be displayed to the user which allows differentiation
   * of multiple tokens that use the same ticker.
   *
   * For example "Holo (HOT)" and "Hydro Protocol (HOT)" get the token
   * names and "Holo" and "Hydro Protocol".
   */
  readonly tokenName: string;

  /**
   * The number of fractional digits the token supports.
   *
   * A quantity is expressed as atomic units. 10^fractionalDigits of those
   * atomic units make up 1 token.
   *
   * E.g. in Ethereum 10^18 wei are 1 ETH and from the quantity 123000000000000000000
   * the last 18 digits are the fractional part and the rest the wole part.
   */
  readonly fractionalDigits: number;
}

export enum BcpTransactionState {
  /** accepted by a blockchain node and in mempool */
  Pending,
  /** successfully written in a block, but cannot yet guarantee it won't be reverted */
  InBlock,
}

export interface BcpBlockInfoPending {
  readonly state: BcpTransactionState.Pending;
}

export interface BcpBlockInfoInBlock {
  readonly state: BcpTransactionState.InBlock;
  /** block height, if the transaction is included in a block */
  readonly height: number;
  /** depth of the transaction's block, starting at 1 as soon as transaction is in a block */
  readonly confirmations: number;
  /** application specific data from executing tx (result, code, tags...) */
  readonly result?: Uint8Array;
}

/** Information attached to a signature about its state in a block */
export type BcpBlockInfo = BcpBlockInfoPending | BcpBlockInfoInBlock;

export interface PostTxResponse {
  /** Information about the block the transaction is in */
  readonly blockInfo: ValueAndUpdates<BcpBlockInfo>;
  /** a unique identifier (hash of the transaction) */
  readonly transactionId: TransactionId;
  /** a human readable debugging log */
  readonly log?: string;
}

export interface ConfirmedTransaction<T extends UnsignedTransaction = UnsignedTransaction>
  extends SignedTransaction<T> {
  readonly height: number; // the block it was written to
  /** depth of the transaction's block, starting at 1 as soon as transaction is in a block */
  readonly confirmations: number;
  /** a unique identifier (hash of the transaction) */
  readonly transactionId: TransactionId;
  /** application specific data from executing tx (result, code, tags...) */
  readonly result?: Uint8Array;
  readonly log?: string;
  // readonly tags: ReadonlyArray<Tag>;
}

export interface BcpQueryTag {
  readonly key: string;
  readonly value: string;
}

export interface BcpTxQuery {
  readonly id?: TransactionId;
  /** chain-specific key value pairs that encode a query */
  readonly tags?: ReadonlyArray<BcpQueryTag>;
  readonly height?: number;
  readonly minHeight?: number;
  readonly maxHeight?: number;
}

export interface BcpAddressQuery {
  readonly address: Address;
}

export interface BcpPubkeyQuery {
  readonly pubkey: PublicKeyBundle;
}

export type BcpAccountQuery = BcpAddressQuery | BcpPubkeyQuery;

// a type checker to use in the account-based queries
export function isAddressQuery(query: BcpAccountQuery): query is BcpAddressQuery {
  return (query as BcpAddressQuery).address !== undefined;
}

export function isPubkeyQuery(query: BcpAccountQuery): query is BcpPubkeyQuery {
  return (query as BcpPubkeyQuery).pubkey !== undefined;
}

/**
 * A printable block ID in a blockchain-specific format.
 *
 * In Lisk, this is a uint64 number like 3444561236416494115 and in BNS this is an upper
 * hex encoded 20 byte hash like 6DD2BFCD9CEFE93C64C15439C513BFD61A0225BB. Ethereum uses
 * 0x-prefixed hashes like 0x4bd6efe48bed3ea4fd25678cc81d1ed372bb8c8654c29880889fed66130c6502
 */
export type BlockId = string & As<"block-id">;

export interface BlockHeader {
  readonly id: BlockId;
  readonly height: number;
  readonly time: ReadonlyDate;
  readonly transactionCount: number;
}

// BcpConnection is a high-level interface to a blockchain node,
// abstracted over all blockchain types and communication channel.
// A direct connection or a proxy server should implement this.
// The implementation takes care to convert our internal types into
// the proper format for the blockchain.
//
// BcpConnection is the minimal interface needed to be supported by any blockchain
// that is compatible with the bcp spec and iov-core library. This supports
// getting account balances, sending tokens, and observing the blockchain state.
//
// There are other optional interfaces that extend this functionality with
// features like atomic swap, NFTs, etc which may be implemented by any connector
// to enable enhanced features in the clients
export interface BcpConnection {
  // blockchain
  readonly disconnect: () => void;
  readonly chainId: () => ChainId;
  readonly height: () => Promise<number>;
  readonly getTicker: (ticker: TokenTicker) => Promise<BcpTicker | undefined>;
  readonly getAllTickers: () => Promise<ReadonlyArray<BcpTicker>>;

  // accounts
  /**
   * Get the current account information (e.g. balance)
   *
   * If an account is not found on the blockchain, this returns undefined.
   */
  readonly getAccount: (query: BcpAccountQuery) => Promise<BcpAccount | undefined>;
  /**
   * Get a nonce for the next transaction signature.
   *
   * Implementation defines a default value if blockchain does not provide a nonce.
   */
  readonly getNonce: (query: BcpAddressQuery | BcpPubkeyQuery) => Promise<Nonce>;
  readonly watchAccount: (account: BcpAccountQuery) => Stream<BcpAccount | undefined>;

  // blocks
  readonly getBlockHeader: (height: number) => Promise<BlockHeader>;
  readonly watchBlockHeaders: () => Stream<BlockHeader>;
  /** @deprecated use watchBlockHeaders().map(header => header.height) */
  readonly changeBlock: () => Stream<number>;

  // transaction
  readonly postTx: (tx: PostableBytes) => Promise<PostTxResponse>;
  readonly searchTx: (query: BcpTxQuery) => Promise<ReadonlyArray<ConfirmedTransaction>>;
  /**
   * Subscribes to all newly added transactions that match the query
   */
  readonly listenTx: (query: BcpTxQuery) => Stream<ConfirmedTransaction>;
  /**
   * Returns a stream for all historical transactions that match
   * the query, along with all new transactions arriving from listenTx
   */
  readonly liveTx: (txQuery: BcpTxQuery) => Stream<ConfirmedTransaction>;
}
