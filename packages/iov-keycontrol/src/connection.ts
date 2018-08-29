/*
This is a proposal that goes along with proxy.ts.

Here we define how to use a connection with sending and receiving
JsonRpc messages and wrap it into request/response and subscribe/event
styles.

This can run over many transport layers.
*/

import { Stream } from "xstream";

import { Message } from "./messages";

// A connection has a read/write message interface
export interface Connection {
  readonly send: (msg: Message) => void;
  readonly receive: Stream<Message>;
}

// A connector is anything that can generate a connection (client)
export type Connector = () => Connection;
