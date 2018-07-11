import axios from "axios";

import { JsonRpcRequest, JsonRpcSuccess, throwIfError } from "./common";

export interface RpcClient {
  readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
}

export const getWindow = (): any | undefined => (typeof window === "object" ? (window as any) : undefined);

// make sure we set the origin header properly, seems not to be set
// in karma tests....
export const getOriginConfig = () => {
  const w = getWindow();
  return w ? { headers: { Origin: w.origin, Referer: `${w.origin}/` } } : undefined;
};

export class HttpClient implements RpcClient {
  protected readonly url: string;

  constructor(url: string = "http://localhost:46657") {
    this.url = url;
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    // make sure we set the origin header properly, seems not to be set
    // in karma tests....
    const response = await axios.post(this.url, request, getOriginConfig());
    return throwIfError(response.data);
  }
}

export class HttpUriClient implements RpcClient {
  protected readonly url: string;

  constructor(url: string = "http://localhost:46657") {
    this.url = url;
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    const method = `${this.url}/${request.method}`;
    const response = await axios.get(method, getOriginConfig());
    return throwIfError(response.data);
  }
}

// TODO: websocket implementation
