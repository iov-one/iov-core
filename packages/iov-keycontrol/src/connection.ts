/*
This is a proposal that goes along with proxy.ts.

Here we define how to use a connection with sending and receiving
JsonRpc messages and wrap it into request/response and subscribe/event
styles.

This can run over many transport layers.
*/

import { Listener, Stream } from "xstream";

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
export interface Connection {
  readonly send: (msg: Message) => void;
  readonly receive: Stream<Message>;
  readonly disconnect: () => void;
}

// ClientInterface is the generic client interface
export interface ClientInterface {
  readonly request: (method: string, params: any) => Promise<any>;
  readonly subscribe: (query: string) => Stream<Event>;
}

export class Client implements ClientInterface {
  private readonly connection: Connection;

  constructor(connection: Connection) {
    this.connection = connection;
    this.connection.receive.subscribe(this.receiver());
  }

  public request(method: string, params: any): Promise<any> {
    const req: RequestMessage = {
      ...envelope(),
      kind: MessageKind.REQUEST,
      method,
      params,
    };
    this.connection.send(req);
    // TODO
    throw new Error("response not implemented");
  }

  public subscribe(query: string): Stream<Event> {
    const sub: SubscribeMessage = {
      ...envelope(),
      kind: MessageKind.REQUEST,
      method: "subscribe",
      params: {
        query,
        subscriptionId: randomId(),
      },
    };
    this.connection.send(sub);
    // TODO: get listener + stream
    throw new Error("stream not implemented");
  }

  private receiver(): Listener<Message> {
    throw new Error("receiver not implemented");
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
    this.connection.receive.subscribe({
      next: (msg: Message) => this.handleMessage(msg),
      error: x => {
        throw x;
      },
      complete: () => this.connection.disconnect(),
    });
  }

  private async handleMessage(msg: Message): Promise<void> {
    // only handle this, ignore others
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
