// import { Transaction } from "@iov/types";
import { Stream } from "xstream";
import { AddressBytes, PublicKeyBundle } from "./keys";
import { SignableTransaction } from "./signables";
import { FungibleToken, Nonce, TokenTicker } from "./transactions";

// import { RPC, Websocket } from "./rpc";
// import { Block, Header } from "./blocks";
// import { ParsedStateObject, StateKey, StateBytes } from "./state";
// import {
//   TransactionBytes,
//   TransactionState,
//   TransactionStateProcessed,
//   TxQueryString,
//   TransactionIDString
// } from "./transactions";

// Node is a high-level interface to a blockchain node,
// abstracted over all blockchain types and communication channel.
// A direct connection or a proxy server should implement this.
// The implementation takes care to convert our internal types into
// the proper format for the blockchain.
//
// The Node will most likely contain some private state to maintain
// the connection, subscription, and such. (sorry will, but even
// a Haskell guru recommended mutable state for this case).
export interface Node {
  // headers returns all headers in that range.
  // If max is underfined, subscribe to all new headers
  // If max is defined, but higher than current height,
  // subscribe to all new headers until max.
  headers(min?: number, max?: number): Stream<Header>;

  // block will query for one block if height is provider,
  // returning it immediately if available, or as soon as it
  // is produced, if in the future.
  // If not height is provided, it will get most recent block
  block(height?: number): Promise<Block>;
  // streamBlocks starts sending a stream of blocks from now on
  streamBlocks(): Stream<Block>;

  // postTx submits a signed tx as is notified on every state change
  postTx(tx: SignableTransaction): Stream<TransactionState>;

  // TODO----

  // // searchTx searches for all tx that match these tags and subscribes to new ones
  // // watchTx is a subset, searching by TxID, not tags
  // searchTx(
  //       query: TxQueryString
  // ): Stream<TransactionStateProcessed>;

  // various types of queries to get a stream of accounts...
  // streams current data and all changes
  watchAccount(query: AccountQuery): Stream<Account>;
  watchNonce(query: AccountQuery): Stream<AccountNonce>;

  getTicker(ticker: TokenTicker): Promise<Ticker>;
  watchAllTickers(): Stream<Ticker>;
}

// TODO: expand on this
export const enum TransactionState {
  PENDING = "PENDING",
  UNCONFIRMED = "UNCONFIRMED",
  CONFIRMED = "CONFIRMED",
  REJECTED = "REJECTED"
}

//------------------------------------------------------------------------
// State types

export const enum AccountQueryType {
  ADDRESS = "ADDRESS",
  NAME = "NAME",
  PUBLIC_KEY = "PUBLIC_KEY"
}

export interface AccountQueryByAddress {
  type: AccountQueryType.ADDRESS;
  address: AddressBytes;
}

export interface AccountQueryByPublicKeyBundle {
  type: AccountQueryType.PUBLIC_KEY;
  PublicKeyBundle: PublicKeyBundle;
}

export interface AccountQueryByName {
  type: AccountQueryType.NAME;
  name: string;
}

export type AccountQuery =
  | AccountQueryByAddress
  | AccountQueryByName
  | AccountQueryByPublicKeyBundle;

// Nonce is a minimal subset of Account for efficiency
export interface AccountNonce {
  PublicKeyBundle?: PublicKeyBundle;
  address: AddressBytes;
  nonce: Nonce;
}

export interface Account extends AccountNonce {
  name?: string;
  balances: ReadonlyArray<Balance>;
  extended: any;
}

export interface Balance extends FungibleToken {
  tokenName?: string;
  sigFigs: number;
}

//----

export interface Ticker {
  tokenTicker: TokenTicker;
  tokenName?: string;
  sigFigs: number;
}

//------------------------------------------------------------------------
// Block types

declare const BlockHashSymbol: unique symbol;
type BlockHash = typeof BlockHashSymbol;
export type BlockHashBytes = Uint8Array & BlockHash;
export type BlockHashString = string & BlockHash;

// Header is an abstraction
export interface Header {
  readonly height: number;
  readonly hash: BlockHashBytes;
  // TODO: much more...
}

// Block is a generic abstraction of a block, including all transactions
export interface Block {
  readonly header: Header;
  readonly transactions: ReadonlyArray<SignableTransaction>;
  // TODO: more?
}
