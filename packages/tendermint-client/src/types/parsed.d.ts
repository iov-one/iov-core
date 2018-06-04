import { Transaction } from "@iov/types";
import { Stream } from "xstream";
import { Block, Header } from "./blocks";
import { RPC, Websocket } from "./rpc";
import { ParsedStateObject, StateBuffer, StateKey } from "./state";
import {
  TransactionBuffer,
  TransactionIDString,
  TransactionState,
  TransactionStateProcessed,
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
  // If not height is provided, it will get most recent block
  block(ws: Websocket, height?: number): Promise<Block>;
  allBlocks(ws: Websocket): Stream<Block>;

  // sendTx submits a signed tx as is notified on every state change
  sendTx(ws: Websocket, tx: Transaction): Stream<TransactionState>;
  // sendTx(ws: Websocket, tx: Transaction): void;
  // sendTx(ws: Websocket, tx: Transaction): Promise<any>;

  // searchTx searches for all tx that match these tags and subscribes to new ones
  // watchTx is a subset, searching by TxID, not tags
  searchTx(
    ws: Websocket,
    query: TxQueryString
  ): Stream<TransactionStateProcessed>;

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
