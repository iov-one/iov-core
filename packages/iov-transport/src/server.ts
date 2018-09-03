import { Stream } from "xstream";

import { Connection } from "./connection";
import { Event, format, Message, MessageKind, ResponseMessage } from "./messages";

// Handler is the mirror of client, but different names,
// signaling it is doing the work, not requesting it
export interface Handler {
  readonly handleRequest: (method: string, params: any) => Promise<any>;
  readonly handleSubscribe: (query: string) => Stream<Event>;
}

export class Server {
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
    if (msg.format !== format) {
      const text = JSON.stringify(msg);
      throw new Error(`Invalid message: ${text}`);
    }

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
