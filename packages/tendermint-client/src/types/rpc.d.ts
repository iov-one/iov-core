import { Observable } from "xstream";

// TODO: define this for real, now just unique type
declare const WebsocketSymbol: unique symbol;
export type Websocket = typeof WebsocketSymbol;

declare const BlockHashSymbol: unique symbol;
type BlockHash = typeof BlockHashSymbol;
export type BlockHashBuffer = Uint8Array & BlockHash;
export type BlockHashString = string & BlockHash;

// TODO: Is this defined better somewhere else?
declare const TransactionSymbol: unique symbol;
type Transaction = typeof TransactionSymbol;
export type TransactionBuffer = Uint8Array & Transaction;
export type TransactionString = string & Transaction;

declare const TransactionIDSymbol: unique symbol;
type TransactionID = typeof TransactionIDSymbol;
// export type TransactionIDBuffer = Uint8Array & TransactionID;
export type TransactionIDString = string & TransactionID;

export type Identifier = (tx: Transaction) => TransactionIDString;

export const enum TransactionStateType {
  PENDING = "PENDING",
  REJECTED = "REJECTED",
  UNCONFIRMED = "UNCONFIRMED",
  CONFIRMED = "CONFIRMED"
}

// TransactionStatePending signfies it is in the mempool, but hasn't
// made it in a block yet.
export interface TransactionStatePending {
  type: TransactionStateType.PENDING;
  txID: TransactionIDString;
}

export interface TransactionStateRejected {
  type: TransactionStateType.REJECTED;
  txID: TransactionIDString;
  error: any;
}

// TransactionStateUnconfirmed is here for completeness,
// But tendermint will never return it,
// We should move the tx stuff elsewhere in any case,
// to standardize across multiple chains
export interface TransactionStateUnconfirmed {
  type: TransactionStateType.UNCONFIRMED;
  txID: TransactionIDString;
  // confidence ranges from 0 to 1 where 1 is confirmed
  // this can be used to show progress
  confidence: number;
  blockHeight: number;
  result: Uint8Array;
  // TODO: tags?
}

export interface TransactionStateConfirmed {
  type: TransactionStateType.CONFIRMED;
  txID: TransactionIDString;
  blockHeight: number;
  result: Uint8Array;
  // TODO: tags?
}

// TransactionState is the current state of the transaction
export type TransactionState =
  | TransactionStatePending
  | TransactionStateRejected
  | TransactionStateUnconfirmed
  | TransactionStateConfirmed;

export interface Header {
  readonly height: number;
  readonly hash: BlockHashString;
  // TODO: much more...
}

export interface Block {
  readonly header: Header;
  readonly transactions: ReadonlyArray<TransactionBuffer>;
  // TODO: more?
}

// RPC captures the needed functionality
export interface RPC {
  // headers returns all headers in that range.
  // If max is underfined, subscribe to all new headers
  // If max is defined, but higher than current height,
  // subscribe to all new headers until max.
  headers(ws: Websocket, min?: number, max?: number): Observable<Header>;

  // block will query for one block if height is provider,
  // returning it immediately if available, or as soon as it
  // is produced, if in the future.
  // If not height is provided, it will subscribe to all new
  // block events
  block(ws: Websocket, height?: number): Observable<Block>;

  // sendTx submits a signed tx as is notified on every state change
  sendTx(ws: Websocket, tx: TransactionBuffer): Observable<TransactionState>;

  // watchKey will query the current state at the given key
  // and be notified upon any change
  watchKey(ws: Websocket, key: StateKey): Observable<StateBuffer>;
}

// Note, we can add transformations on top....

declare const ParsedStateSymbol: unique symbol;
type ParsedState = typeof ParsedStateSymbol;

declare const StateSymbol: unique symbol;
type State = typeof StateSymbol;
export type StateBuffer = Uint8Array & State;

export interface StateKey {
  readonly app: string;
  readonly key: Uint8Array;
}

export type StateParser = (state: StateBuffer) => ParsedState;
