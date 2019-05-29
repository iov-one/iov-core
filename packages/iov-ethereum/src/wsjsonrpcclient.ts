import { JsonRpcRequest, JsonRpcResponse, parseJsonRpcResponse2 } from "@iov/jsonrpc";
import { StreamingSocket } from "@iov/socket";

import { JsonRpcClient } from "./jsonrpcclient";

function isNonNull<T>(t: T | null): t is T {
  return t !== null;
}

export class WsJsonRpcClient implements JsonRpcClient {
  private readonly socket: StreamingSocket;

  public constructor(socket: StreamingSocket) {
    this.socket = socket;
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
}
