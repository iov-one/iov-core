import { Stream } from "xstream";
import { Block, Header } from "./blocks";
import { StateKey, StateBuffer } from "./state";
import { TransactionBuffer, TransactionState } from "./transactions";

// TODO: define this for real, now just unique type
declare const WebsocketSymbol: unique symbol;
export type Websocket = typeof WebsocketSymbol;

// RPC captures the needed functionality
export interface RPC {
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
  sendTx(ws: Websocket, tx: TransactionBuffer): Stream<TransactionState>;

  // watchKey will query the current state at the given key
  // and be notified upon any change
  watchKey(ws: Websocket, key: StateKey): Stream<StateBuffer>;
}
