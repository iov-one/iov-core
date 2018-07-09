import axios from "axios";

import { JsonRpcRequest, JsonRpcSuccess, throwIfError } from "./common";

export interface RpcClient {
  readonly rpc: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
}

export class HttpClient implements RpcClient {
  protected readonly url: string;

  constructor(rpcServer: string = "http://localhost:46657") {
    this.url = rpcServer;
  }

  public async rpc(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    const response = await axios.post(this.url, request);
    return throwIfError(response.data);
  }
}

// TODO: websocket implementation
