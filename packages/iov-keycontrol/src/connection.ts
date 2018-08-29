/*
This is a proposal that goes along with proxy.ts.

Here we define how to use a connection with sending and receiving
JsonRpc messages and wrap it into request/response and subscribe/event
styles.

This can run over many transport layers.
*/

import { Stream } from "xstream";

// import { ErrorMessage, Event, EventMessage, Message, RequestMessage, ResponseMessage } from "./messages";
import { Event, Message } from "./messages";

// A connector is anything that can generate a connection (client)
export type Connector = () => Connection;

// A connection has a read/write message interface
export interface Connection {
  readonly send: (msg: Message) => void;
  readonly receive: Stream<Message>;
}

export interface Client {
  readonly request: (method: string, params: any) => Promise<any>;
  readonly subscribe: (query: string) => Stream<Event>;
}

// Server is the mirror of client, but different names,
// signaling it is doing the work, not requesting it
export interface Server {
  readonly handleRequest: (method: string, params: any) => Promise<any>;
  readonly handleSubscribe: (query: string) => Stream<Event>;
}
