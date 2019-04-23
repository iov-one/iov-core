import axios from "axios";

import {
  JsonRpcRequest,
  JsonRpcResponse,
  parseJsonRpcErrorResponse,
  parseJsonRpcSuccessResponse,
} from "@iov/jsonrpc";

export class HttpJsonRpcClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const result = await axios.post(this.baseUrl, request);
    const responseBody = result.data;

    let response: JsonRpcResponse;
    try {
      response = parseJsonRpcErrorResponse(responseBody);
    } catch (_) {
      response = parseJsonRpcSuccessResponse(responseBody);
    }
    return response;
  }
}
