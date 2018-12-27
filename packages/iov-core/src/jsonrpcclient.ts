import { Producer, Stream } from "xstream";

import { toListPromise } from "@iov/stream";

export interface JsonRpcRequest {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly method: string;
  readonly params: ReadonlyArray<any>;
}

export interface JsonRpcResponse {
  readonly jsonrpc: "2.0";
  readonly id: number;
  readonly result: any;
}

export const jsonRpcCodeParseError = -32700;
export const jsonRpcCodeInvalidRequest = -32600;
export const jsonRpcCodeMethodNotFound = -32601;
export const jsonRpcCodeInvalidParams = -32602;
export const jsonRpcCodeInternalError = -32603;
// server error (Reserved for implementation-defined server-errors.):
// -32000 to -32099
export const jsonRpcCodeServerErrorDefault = -32000;

/**
 * And error object as described in https://www.jsonrpc.org/specification#error_object
 */
export interface JsonRpcErrorResponse {
  readonly jsonrpc: "2.0";
  readonly id: number | null;
  readonly error: {
    readonly code: number;
    readonly message: string;
    readonly data?: any;
  };
}

function isJsonRpcErrorResponse(
  response: JsonRpcResponse | JsonRpcErrorResponse,
): response is JsonRpcErrorResponse {
  return typeof (response as JsonRpcErrorResponse).error === "object";
}

function parseJsonRpcError(data: any): JsonRpcErrorResponse | undefined {
  if (typeof data !== "object") {
    throw new Error("Data must be an object");
  }

  if (data.jsonrpc !== "2.0") {
    throw new Error(`Got unexpected jsonrpc version: ${JSON.stringify(data)}`);
  }

  const id = data.id;
  if (typeof id !== "number") {
    throw new Error("Invalid id field");
  }

  const error = data.error;
  if (typeof error === "undefined") {
    return undefined;
  }

  return {
    jsonrpc: "2.0",
    id: id,
    error: error,
  };
}

function parseJsonRpcResponse(data: any): JsonRpcResponse {
  if (typeof data !== "object") {
    throw new Error("Data must be an object");
  }

  if (data.jsonrpc !== "2.0") {
    throw new Error(`Got unexpected jsonrpc version: ${JSON.stringify(data)}`);
  }

  const id = data.id;
  if (typeof id !== "number") {
    throw new Error("Invalid id field");
  }

  const result = data.result;

  return {
    jsonrpc: "2.0",
    id: id,
    result: result,
  };
}

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
