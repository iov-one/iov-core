import { Stream } from "xstream";

import { toListPromise } from "@iov/stream";

import { isJsonRpcErrorResponse, JsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse } from "./types";

export interface SimpleMessagingConnection {
  readonly responseStream: Stream<JsonRpcResponse | JsonRpcErrorResponse>;
  readonly sendRequest: (request: JsonRpcRequest) => void;
}

export class JsonRpcClient {
  private readonly connection: SimpleMessagingConnection;

  constructor(connection: SimpleMessagingConnection) {
    this.connection = connection;
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const filteredStream = this.connection.responseStream.filter(r => r.id === request.id);
    const pendingResponses = toListPromise(filteredStream, 1);
    this.connection.sendRequest(request);

    const response = (await pendingResponses)[0];
    if (isJsonRpcErrorResponse(response)) {
      const error = response.error;
      throw new Error(`JSON RPC error: code=${error.code}; message='${error.message}'`);
    }

    return response;
  }
}
