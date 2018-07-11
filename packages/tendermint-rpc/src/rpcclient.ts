import axios from "axios";

import { JsonRpcRequest, JsonRpcSuccess, throwIfError } from "./common";

export interface RpcClient {
  readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
}

export const getWindow = (): any | undefined => (typeof window === "object" ? (window as any) : undefined);
export const inBrowser = (): boolean => getWindow() !== undefined;

// post uses fetch in browser and axios in node,
// was having weird issues with axios in brower
const http = (method: string, url: string, request?: any): Promise<any> => {
  if (inBrowser()) {
    const body = request ? JSON.stringify(request) : undefined;
    return fetch(url, { method, body }).then(res => res.json());
  } else {
    return axios.request({ url, method, data: request }).then(res => res.data);
  }
};

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
    const response = await http("POST", this.url, request);
    return throwIfError(response);
  }
}

// HttpUriClient just makes calls without any parameters
// This is only meant for testing or quick status/health checks
export class HttpUriClient implements RpcClient {
  protected readonly url: string;

  constructor(url: string = "http://localhost:46657") {
    this.url = url;
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    if (request.params && Object.keys(request.params).length !== 0) {
      throw new Error(`HttpUriClient doesn't support passing params: ${request.params}`);
    }
    const method = `${this.url}/${request.method}`;
    const response = await http("GET", method);
    return throwIfError(response);
  }
}

// TODO: websocket implementation
