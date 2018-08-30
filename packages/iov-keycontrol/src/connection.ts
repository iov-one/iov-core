/*
This is a proposal that goes along with proxy.ts.

Here we define how to use a connection with sending and receiving
JsonRpc messages and wrap it into request/response and subscribe/event
styles.

This can run over many transport layers.
*/

import { Listener, Producer, Stream } from "xstream";

// import { ErrorMessage, Event, EventMessage, Message, ResponseMessage } from "./messages";
import {
  envelope,
  Event,
  format,
  Message,
  MessageKind,
  randomId,
  RequestMessage,
  ResponseMessage,
  SubscribeMessage,
} from "./messages";

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
class SendProducer<T> implements Producer<T> {
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

type EventProducer = SendProducer<Event>;
type MessageProducer = SendProducer<Message>;

export const mockConnectionPair = (): [Connection, Connection] => {
  const a = new SendProducer<Message>();
  const b = new SendProducer<Message>();
  return [makeConnection(a, b), makeConnection(b, a)];
};

const makeConnection = (client: MessageProducer, server: MessageProducer): Connection => ({
  send: client.send,
  receive: Stream.create(server),
  disconnect: () => client.stop(),
});

// Promiser holds the callbacks to later resolve Promise from different
// control flow
interface Promiser {
  readonly resolve: (value: any) => void;
  readonly reject: (err: any) => void;
}

// Client sends requests to a connection and gets responses,
// possibly out of order
export class Client {
  private readonly connection: Connection;
  private readonly resolvers: Map<string, Promiser>;
  private readonly streams: Map<string, EventProducer>;

  constructor(connection: Connection) {
    this.connection = connection;
    this.resolvers = new Map<string, Promiser>();
    this.streams = new Map<string, EventProducer>();
    this.listen();
  }

  public request(method: string, params: any): Promise<any> {
    const req: RequestMessage = {
      ...envelope(),
      kind: MessageKind.REQUEST,
      method,
      params,
    };
    this.connection.send(req);
    return new Promise<any>((resolve, reject) => {
      // TODO: make sure nothing already registered
      this.resolvers.set(req.id, { resolve, reject });
    });
  }

  public subscribe(query: string): Stream<Event> {
    const subscriptionId = randomId();

    const sub: SubscribeMessage = {
      ...envelope(),
      kind: MessageKind.REQUEST,
      method: "subscribe",
      params: {
        query,
        subscriptionId,
      },
    };
    this.connection.send(sub);
    const producer = new SendProducer<Event>();
    // TODO: somehow store this to unsubscribe if subscription request
    // above returns an error
    this.streams.set(subscriptionId, producer);
    return Stream.create(producer);
  }

  private listen(): void {
    const subscription = this.connection.receive.subscribe({
      next: (msg: Message) => this.handleMessage(msg),
      error: x => {
        throw x;
      },
      complete: () => {
        subscription.unsubscribe();
        this.connection.disconnect();
      },
    });
  }

  private handleMessage(msg: Message): void {
    // TODO: enforce proper format
    switch (msg.kind) {
      case MessageKind.RESPONSE:
      case MessageKind.ERROR:
        const res = this.resolvers.get(msg.id);
        if (!res) {
          throw new Error(`Unknown response ${msg.id}`);
        } else {
          msg.kind === MessageKind.RESPONSE ? res.resolve(msg.result) : res.reject(msg.error);
          this.resolvers.delete(msg.id);
        }
        break;
      case MessageKind.EVENT:
        const prod = this.streams.get(msg.id);
        if (!prod) {
          throw new Error(`Unknown event ${msg.id}`);
        } else {
          prod.send(msg.event);
        }
    }
  }
}

// Handler is the mirror of client, but different names,
// signaling it is doing the work, not requesting it
export interface Handler {
  readonly handleRequest: (method: string, params: any) => Promise<any>;
  readonly handleSubscribe: (query: string) => Stream<Event>;
}

export class Server {
  // TODO: implement generic listener? Or are these protocol
  // specific functions??
  // public static listen(/* something that spawns connections, handler */)

  private readonly connection: Connection;
  private readonly handler: Handler;

  constructor(connection: Connection, handler: Handler) {
    this.connection = connection;
    this.handler = handler;
    this.listen();
  }

  private listen(): void {
    const subscription = this.connection.receive.subscribe({
      next: (msg: Message) => this.handleMessage(msg),
      error: x => {
        throw x;
      },
      complete: () => {
        subscription.unsubscribe();
        this.connection.disconnect();
      },
    });
  }

  private async handleMessage(msg: Message): Promise<void> {
    // TODO: enforce proper format

    // only handle requests, ignore others
    if (msg.kind === MessageKind.REQUEST) {
      // TODO: handle subscriptions specially
      const result = await this.handler.handleRequest(msg.method, msg.params);
      const response: ResponseMessage = {
        format,
        id: msg.id,
        kind: MessageKind.RESPONSE,
        result,
      };
      this.connection.send(response);
    }
  }
}
