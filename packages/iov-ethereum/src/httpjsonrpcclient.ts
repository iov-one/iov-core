import axios from "axios";

import { JsonRpcRequest, JsonRpcResponse, parseJsonRpcResponse2 } from "@iov/jsonrpc";

import { JsonRpcClient } from "./jsonrpcclient";

export class HttpJsonRpcClient implements JsonRpcClient {
  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const result = await axios.post(this.baseUrl, request);
    return parseJsonRpcResponse2(result.data);
  }
}
