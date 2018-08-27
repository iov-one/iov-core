import { As } from "type-tagger";

export type RpcId = string & As<"rpcid">;

export const rpcVersion = "2.0";

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

export const jsonRpc = (): JsonRpc => ({ jsonrpc: "2.0", id: randomId() });
export const jsonRpcWith = (method: string, params?: {}): JsonRpcRequest => ({
  ...jsonRpc(),
  method,
  params: params || {},
});

export const throwIfError = (resp: JsonRpcResponse): JsonRpcSuccess => {
  const asError = ifError(resp);
  if (asError) {
    throw asError;
  }
  return resp as JsonRpcSuccess;
};

export const ifError = (resp: JsonRpcResponse): Error | undefined => {
  const asError = resp as JsonRpcError;
  if (asError.error !== undefined) {
    return new Error(JSON.stringify(asError.error));
  }
  return undefined;
};

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// generate a random alphanumeric character
export const randomChar = (): string => chars[Math.floor(Math.random() * chars.length)];
export const randomId = (): RpcId =>
  Array.from({ length: 12 })
    .map(() => randomChar())
    .join("") as RpcId;
