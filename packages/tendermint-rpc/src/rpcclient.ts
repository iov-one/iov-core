import axios from "axios";

import { JsonRpcRequest, JsonRpcResponse } from "./common";

export interface RpcClient {
  readonly rpc: (request: JsonRpcRequest) => Promise<JsonRpcResponse>;
}

export class HttpClient implements RpcClient {
  protected readonly url: string;

  constructor(rpcServer: string = "http://localhost:46657") {
    this.url = rpcServer;
  }

  public rpc(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    return axios.post(this.url, request).then(res => res.data as JsonRpcResponse);
  }
}

// TODO: websocket implementation
