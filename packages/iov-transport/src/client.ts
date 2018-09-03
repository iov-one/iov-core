import { Stream } from "xstream";

import { Connection, EventProducer, SendProducer } from "./connection";
import {
  envelope,
  Event,
  format,
  Message,
  MessageKind,
  randomId,
  RequestMessage,
  SubscribeMessage,
} from "./messages";

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
      // make sure nothing already registered
      if (this.resolvers.get(req.id)) {
        reject(`Cannot reuse ${req.id}, request currently pending`);
      } else {
        this.resolvers.set(req.id, { resolve, reject });
      }
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
    // this.resolvers.set(sub.id, ...)
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
    if (msg.format !== format) {
      const text = JSON.stringify(msg);
      throw new Error(`Invalid message: ${text}`);
    }

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
