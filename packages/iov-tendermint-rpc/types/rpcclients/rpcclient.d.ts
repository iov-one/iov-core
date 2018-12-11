import { Stream } from "xstream";
import { JsonRpcEvent, JsonRpcRequest, JsonRpcSuccess } from "../jsonrpc";
export interface RpcClient {
    readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
    readonly disconnect: () => void;
}
export interface RpcStreamingClient extends RpcClient {
    readonly listen: (request: JsonRpcRequest) => Stream<JsonRpcEvent>;
}
export declare function instanceOfRpcStreamingClient(client: RpcClient): client is RpcStreamingClient;
export declare function hasProtocol(url: string): boolean;
