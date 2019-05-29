import { Stream } from "xstream";

import { JsonRpcRequest, JsonRpcResponse, parseJsonRpcResponse2 } from "@iov/jsonrpc";
import { SocketWrapperMessageEvent, StreamingSocket } from "@iov/socket";

import { JsonRpcClient } from "./jsonrpcclient";

function isNonNull<T>(t: T | null): t is T {
  return t !== null;
}

export class WsJsonRpcClient implements JsonRpcClient {
  public readonly events: Stream<SocketWrapperMessageEvent>;
  private readonly socket: StreamingSocket;

  public constructor(baseUrl: string) {
    this.socket = new StreamingSocket(baseUrl);
    this.events = this.socket.events;
    this.socket.connect();
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    await this.socket.connected;

    const response = new Promise<JsonRpcResponse>((resolve, reject) => {
      this.socket.events
        .map(event => {
          try {
            return parseJsonRpcResponse2(JSON.parse(event.data));
          } catch (error) {
            return null;
          }
        })
        .filter(isNonNull)
        .filter(data => data.id === request.id)
        .take(1)
        .addListener({
          next: resolve,
          error: reject,
        });
    });

    await this.socket.send(JSON.stringify(request));

    return response;
  }

  public async socketSend(request: JsonRpcRequest, ignoreNetworkError: boolean = false): Promise<void> {
    await this.socket.connected;
    const data = JSON.stringify(request);

    try {
      await this.socket.send(data);
    } catch (error) {
      if (!ignoreNetworkError) {
        throw error;
      }
    }
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}
