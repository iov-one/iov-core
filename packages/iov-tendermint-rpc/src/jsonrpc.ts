import {
  isJsonRpcErrorResponse,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccessResponse,
} from "@iov/jsonrpc";

// JsonRpcEvent is event info stored in result of JsonRpcSuccess
export interface JsonRpcEvent {
  readonly query: string;
  readonly data: {
    readonly type: string;
    readonly value: any;
  };
}

export function jsonRpcWith(method: string, params?: {}): JsonRpcRequest {
  return {
    jsonrpc: "2.0",
    id: randomId(),
    method: method,
    params: params || {},
  };
}

export function throwIfError(resp: JsonRpcResponse): JsonRpcSuccessResponse {
  if (isJsonRpcErrorResponse(resp)) {
    throw new Error(JSON.stringify(resp.error));
  }
  return resp;
}

export function ifError(resp: JsonRpcResponse): Error | undefined {
  if (isJsonRpcErrorResponse(resp)) {
    return new Error(JSON.stringify(resp.error));
  }
  return undefined;
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** generates a random alphanumeric character  */
export function randomChar(): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

export function randomId(): string {
  return Array.from({ length: 12 })
    .map(() => randomChar())
    .join("");
}
