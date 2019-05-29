import { As } from "type-tagger";

export type RpcId = string & As<"rpcid">;

export interface JsonRpc {
  readonly jsonrpc: "2.0";
  readonly id: RpcId;
}

export interface JsonRpcRequest extends JsonRpc {
  readonly method: string;
  readonly params: {};
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

export interface JsonRpcSuccess extends JsonRpc {
  readonly result: any;
}

export interface JsonRpcError extends JsonRpc {
  readonly error: {
    readonly code: number;
    readonly message: string;
    readonly data?: string;
  };
}

// JsonRpcEvent is event info stored in result of JsonRpcSuccess
export interface JsonRpcEvent {
  readonly query: string;
  readonly data: {
    readonly type: string;
    readonly value: any;
  };
}

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

/** generates a random alphanumeric character  */
export function randomChar(): string {
  return chars[Math.floor(Math.random() * chars.length)];
}

export function randomId(): RpcId {
  return Array.from({ length: 12 })
    .map(() => randomChar())
    .join("") as RpcId;
}

export function jsonRpc(): JsonRpc {
  return { jsonrpc: "2.0", id: randomId() };
}

export function jsonRpcWith(method: string, params?: {}): JsonRpcRequest {
  return {
    ...jsonRpc(),
    method: method,
    params: params || {},
  };
}

export function ifError(resp: JsonRpcResponse): Error | undefined {
  const asError = resp as JsonRpcError;
  if (asError.error !== undefined) {
    return new Error(JSON.stringify(asError.error));
  }
  return undefined;
}

export function throwIfError(resp: JsonRpcResponse): JsonRpcSuccess {
  const asError = ifError(resp);
  if (asError) {
    throw asError;
  }
  return resp as JsonRpcSuccess;
}
