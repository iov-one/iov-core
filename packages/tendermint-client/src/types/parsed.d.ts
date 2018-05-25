import { Transaction } from "@iov/types";
import { Stream } from "xstream";
import { RPC, Websocket } from "./rpc";
import { Block, Header } from "./blocks";
import { ParsedStateObject, StateKey, StateBuffer } from "./state";
import {
  ProcessedTransactionState,
  TransactionBuffer,
  TransactionState,
  TxQueryString
} from "./transactions";

// ParsedRPC handles all the serialization of data structures, and allows
// us to work with high-level concepts
export interface ParsedRPC {
  // headers returns all headers in that range.
  // If max is underfined, subscribe to all new headers
  // If max is defined, but higher than current height,
  // subscribe to all new headers until max.
  headers(ws: Websocket, min?: number, max?: number): Stream<Header>;

  // block will query for one block if height is provider,
  // returning it immediately if available, or as soon as it
  // is produced, if in the future.
  // If not height is provided, it will subscribe to all new
  // block events
  block(ws: Websocket, height?: number): Stream<Block>;

  // sendTx submits a signed tx as is notified on every state change
  sendTx(ws: Websocket, tx: Transaction): Stream<TransactionState>;

  // searchTx searches for all tx that match these tags and subscribes to new ones
  searchTx(
    ws: Websocket,
    query: TxQueryString
  ): Stream<ProcessedTransactionState>;

  // watchKey will query the current state at the given key
  // and be notified upon any change
  watchKey(ws: Websocket, key: StateKey): Stream<ParsedStateObject>;
}

export type StateParser = (state: StateBuffer) => ParsedStateObject;
export type TxEncoder = (tx: Transaction) => TransactionBuffer;
// export type TxParser = (rawTx: TransactionBuffer) => Transaction;

export type ParseRPC = (
  parseState: StateParser,
  encodeTx: TxEncoder
) => (rpc: RPC) => ParsedRPC;
