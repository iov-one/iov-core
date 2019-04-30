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
