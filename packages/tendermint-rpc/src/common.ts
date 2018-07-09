export type RpcId = string;

export const rpcVersion = "2.0";

export interface JsonRpc {
  readonly jsonrpc: "2.0";
  readonly id: RpcId;
}

export function id<T>(x: T): T {
  return x;
}
