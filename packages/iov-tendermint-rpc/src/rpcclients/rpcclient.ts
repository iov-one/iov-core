import { Stream } from "xstream";
import { JsonRpcEvent, JsonRpcRequest, JsonRpcSuccess } from "../jsonrpc";

export interface RpcClient {
  readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
  readonly disconnect: () => void;
}

export interface RpcStreamingClient extends RpcClient {
  readonly listen: (request: JsonRpcRequest) => Stream<JsonRpcEvent>;
}

export function instanceOfRpcStreamingClient(client: RpcClient): client is RpcStreamingClient {
  return typeof (client as any).listen === "function";
}

// Helpers for all RPC clients

export function hasProtocol(url: string): boolean {
  return url.search("://") !== -1;
}
