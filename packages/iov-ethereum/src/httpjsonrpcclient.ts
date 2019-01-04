import axios from "axios";

import { JsonRpcErrorResponse, JsonRpcRequest, JsonRpcResponse, parseJsonRpcResponse } from "@iov/jsonrpc";

export class HttpJsonRpcClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse | JsonRpcErrorResponse> {
    const result = await axios.post(this.baseUrl, request);
    const responseBody = result.data;
    return parseJsonRpcResponse(responseBody);
  }
}
