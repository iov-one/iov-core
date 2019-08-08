import { JsonRpcRequest, JsonRpcResponse, parseJsonRpcResponse } from "@iov/jsonrpc";
import axios from "axios";
import xstream from "xstream";

import { EthereumRpcClient } from "./ethereumrpcclient";

export class HttpEthereumRpcClient implements EthereumRpcClient {
  public readonly events = xstream.throw(
    new Error("Events are not available when connecting via HTTP, use Websockets instead."),
  );

  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const result = await axios.post(this.baseUrl, request);
    return parseJsonRpcResponse(result.data);
  }

  public async socketSend(): Promise<void> {
    throw new Error("No socket available");
  }

  public disconnect(): void {
    // Not necessary for HTTP
  }
}
