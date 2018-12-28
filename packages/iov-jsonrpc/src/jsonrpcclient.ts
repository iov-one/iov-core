import { Producer, Stream } from "xstream";

import { toListPromise } from "@iov/stream";

import { parseJsonRpcError, parseJsonRpcResponse } from "./parse";
import { isJsonRpcErrorResponse, JsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse } from "./types";

interface SimpleMessagingConnection {
  // tslint:disable-next-line:readonly-keyword
  onmessage: ((this: Worker, ev: MessageEvent) => any) | null;
  // tslint:disable-next-line:readonly-array
  readonly postMessage: (message: any, transfer?: Transferable[]) => void;
}

export class JsonRpcClient {
  private readonly responseStream: Stream<JsonRpcResponse | JsonRpcErrorResponse>;
  private readonly connection: SimpleMessagingConnection;

  constructor(connection: SimpleMessagingConnection) {
    this.connection = connection;

    const producer: Producer<JsonRpcResponse | JsonRpcErrorResponse> = {
      start: listener => {
        this.connection.onmessage = event => {
          // console.log("Got message from connection", event);
          const responseError = parseJsonRpcError(event.data);
          if (responseError) {
            listener.next(responseError);
          } else {
            const response = parseJsonRpcResponse(event.data);
            listener.next(response);
          }
        };
      },
      stop: () => (this.connection.onmessage = null),
    };
    this.responseStream = Stream.create(producer);
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const filteredStream = this.responseStream.filter(r => r.id === request.id);
    const pendingResponses = toListPromise(filteredStream, 1);
    this.connection.postMessage(request);

    const response = (await pendingResponses)[0];
    if (isJsonRpcErrorResponse(response)) {
      const error = response.error;
      throw new Error(`JSON RPC error: code=${error.code}; message='${error.message}'`);
    }

    return response;
  }
}
