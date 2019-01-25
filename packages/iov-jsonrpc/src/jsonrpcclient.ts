import { Stream } from "xstream";

import { firstEvent } from "@iov/stream";

import { isJsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse, JsonRpcSuccessResponse } from "./types";

export interface SimpleMessagingConnection {
  readonly responseStream: Stream<JsonRpcResponse>;
  readonly sendRequest: (request: JsonRpcRequest) => void;
}

export class JsonRpcClient {
  private readonly connection: SimpleMessagingConnection;

  constructor(connection: SimpleMessagingConnection) {
    this.connection = connection;
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcSuccessResponse> {
    const filteredStream = this.connection.responseStream.filter(r => r.id === request.id);
    const pendingResponses = firstEvent(filteredStream);
    this.connection.sendRequest(request);

    const response = await pendingResponses;
    if (isJsonRpcErrorResponse(response)) {
      const error = response.error;
      throw new Error(`JSON RPC error: code=${error.code}; message='${error.message}'`);
    }

    return response;
  }
}
