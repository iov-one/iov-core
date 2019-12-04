import { JsonRpcRequest, JsonRpcResponse, parseJsonRpcResponse } from "@iov/jsonrpc";
import { ReconnectingSocket, SocketWrapperMessageEvent } from "@iov/socket";
import { Stream } from "xstream";

import { EthereumRpcClient } from "./ethereumrpcclient";

function isNonNull<T>(t: T | null): t is T {
  return t !== null;
}

export class WsEthereumRpcClient implements EthereumRpcClient {
  public readonly events: Stream<SocketWrapperMessageEvent>;
  private readonly socket: ReconnectingSocket;

  public constructor(baseUrl: string) {
    this.socket = new ReconnectingSocket(baseUrl);
    this.events = this.socket.events;
    this.socket.connect();
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const response = new Promise<JsonRpcResponse>((resolve, reject) => {
      this.socket.events
        .map(event => {
          try {
            return parseJsonRpcResponse(JSON.parse(event.data));
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

    this.socket.queueRequest(JSON.stringify(request));

    return response;
  }

  public async socketSend(request: JsonRpcRequest, ignoreNetworkError = false): Promise<void> {
    const data = JSON.stringify(request);
    try {
      this.socket.queueRequest(data);
    } catch (error) {
      if (!ignoreNetworkError) throw error;
    }
  }

  public disconnect(): void {
    this.socket.disconnect();
  }
}
