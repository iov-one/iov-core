declare class As<Tag extends string> {
  private readonly "_ _ _": Tag;
}

export type RpcId = string & As<"rpcid">;

export const rpcVersion = "2.0";

export interface JsonRpc {
  readonly jsonrpc: "2.0";
  readonly id: RpcId;
}

export interface JsonRpcRequest extends JsonRpc {
  readonly method: string;
  readonly params?: {};
}

export const jsonRpc = (): JsonRpc => ({ jsonrpc: "2.0", id: randomId() });
export const jsonRpcWith = (method: string, params?: {}): JsonRpcRequest => ({
  ...jsonRpc(),
  method,
  params,
});

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// generate a random alphanumeric character
const randomChar = (): string => chars[Math.floor(Math.random() * chars.length)];
const randomId = (): RpcId =>
  Array(12)
    .map(() => randomChar())
    .join("") as RpcId;
