/*
This is a proposal that goes along with proxy.ts.

Here we define how to use a connection with sending and receiving
JsonRpc messages and wrap it into request/response and subscribe/event
styles.

This can run over many transport layers.
*/

import { Listener, Producer, Stream } from "xstream";

import { Event, Message } from "./messages";

// A connector is anything that can generate a connection (client)
export type Connector = () => Connection;

// A connection has a read/write message interface
// TODO: simple implementations as local stream, websocket, etc...
export interface Connection {
  readonly send: (msg: Message) => void;
  readonly receive: Stream<Message>;
  readonly disconnect: () => void;
}

// SendProducer<T> allows us to send events to a listener
export class SendProducer<T> implements Producer<T> {
  // tslint:disable-next-line:readonly-keyword
  private listener: Listener<T> | undefined;

  public start(listener: Listener<T>): void {
    // tslint:disable-next-line:no-object-mutation
    this.listener = listener;
  }

  public stop(): void {
    if (this.listener) {
      this.listener.complete();
      // tslint:disable-next-line:no-object-mutation
      this.listener = undefined;
    }
  }

  public send(msg: T): void {
    if (this.listener) {
      this.listener.next(msg);
    }
  }
}

export type EventProducer = SendProducer<Event>;
export type MessageProducer = SendProducer<Message>;

// localConnectionPair returns a pair of connections that can be
// pass to Client and Server for them to communicate.
//
// Generally thought of for tests, but could also be used
// to isolate components within one process.
export const localConnectionPair = (): [Connection, Connection] => {
  const a = new SendProducer<Message>();
  const b = new SendProducer<Message>();
  return [localConnection(a, b), localConnection(b, a)];
};

const localConnection = (client: MessageProducer, server: MessageProducer): Connection => ({
  send: (msg: Message) => client.send(msg),
  receive: Stream.create(server),
  disconnect: () => client.stop(),
});
