import { As } from "@iov/types";

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
  readonly result: {};
}

export interface JsonRpcError extends JsonRpc {
  readonly error: {
    readonly code: number;
    readonly message: string;
    readonly data?: string;
  };
}

export const jsonRpc = (): JsonRpc => ({ jsonrpc: "2.0", id: randomId() });
export const jsonRpcWith = (method: string, params?: {}): JsonRpcRequest => ({
  ...jsonRpc(),
  method,
  params: params || {},
});

export const throwIfError = (resp: JsonRpcResponse): JsonRpcSuccess => {
  const asError = resp as JsonRpcError;
  if (asError.error !== undefined) {
    throw new Error(JSON.stringify(asError.error));
  }
  return resp as JsonRpcSuccess;
};

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// generate a random alphanumeric character
export const randomChar = (): string => chars[Math.floor(Math.random() * chars.length)];
export const randomId = (): RpcId =>
  Array.from({ length: 12 })
    .map(() => randomChar())
    .join("") as RpcId;
