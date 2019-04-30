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
export declare function instanceOfRpcStreamingClient(client: RpcClient): client is RpcStreamingClient;
export declare function hasProtocol(url: string): boolean;
