import axios from "axios";
import xstream from "xstream";

import { JsonRpcRequest, JsonRpcResponse, parseJsonRpcResponse2 } from "@iov/jsonrpc";

import { JsonRpcClient } from "./jsonrpcclient";

export class HttpJsonRpcClient implements JsonRpcClient {
  public readonly events = xstream.throw(
    new Error("Events are not available when connecting via HTTP, use Websockets instead."),
  );

  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async run(request: JsonRpcRequest): Promise<JsonRpcResponse> {
    const result = await axios.post(this.baseUrl, request);
    return parseJsonRpcResponse2(result.data);
  }

  public async socketSend(): Promise<void> {
    throw new Error("No socket available");
  }

  public disconnect(): void {
    // Not necessary for HTTP
  }
}
