import { Stream } from "xstream";

import { JsonRpcRequest, JsonRpcSuccessResponse } from "@iov/jsonrpc";

import { JsonRpcEvent } from "../jsonrpc";

export interface RpcClient {
  readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccessResponse>;
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
