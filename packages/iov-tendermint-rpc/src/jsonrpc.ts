import { As } from "type-tagger";

export type RpcId = string & As<"rpcid">;

export interface JsonRpcRequest {
  readonly jsonrpc: "2.0";
  readonly id: RpcId;
  readonly method: string;
  readonly params: {};
}

export type JsonRpcResponse = JsonRpcSuccess | JsonRpcError;

export interface JsonRpcSuccess {
  readonly jsonrpc: "2.0";
  readonly id: RpcId;
  readonly result: any;
}

export interface JsonRpcError {
  readonly jsonrpc: "2.0";
  readonly id: RpcId;
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

export function jsonRpcWith(method: string, params?: {}): JsonRpcRequest {
  return {
    jsonrpc: "2.0",
    id: randomId(),
    method: method,
    params: params || {},
  };
}

export function throwIfError(resp: JsonRpcResponse): JsonRpcSuccess {
  const asError = ifError(resp);
  if (asError) {
    throw asError;
  }
  return resp as JsonRpcSuccess;
}

export function ifError(resp: JsonRpcResponse): Error | undefined {
  const asError = resp as JsonRpcError;
  if (asError.error !== undefined) {
    return new Error(JSON.stringify(asError.error));
  }
  return undefined;
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
