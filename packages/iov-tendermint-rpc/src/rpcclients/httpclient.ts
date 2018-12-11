import axios from "axios";

import { JsonRpcRequest, JsonRpcSuccess, throwIfError } from "../jsonrpc";
import { hasProtocol, RpcClient } from "./rpcclient";

function inBrowser(): boolean {
  return typeof window === "object";
}

function filterBadStatus(res: Response): Response {
  if (res.status >= 400) {
    throw new Error(`Bad status on response: ${res.status}`);
  }
  return res;
}

// post uses fetch in browser and axios in node,
// was having weird issues with axios in brower
function http(method: string, url: string, request?: any): Promise<any> {
  if (inBrowser()) {
    const body = request ? JSON.stringify(request) : undefined;
    return fetch(url, { method, body })
      .then(filterBadStatus)
      .then(res => res.json());
  } else {
    return axios.request({ url, method, data: request }).then(res => res.data) as Promise<any>;
  }
}

export class HttpClient implements RpcClient {
  protected readonly url: string;

  constructor(url: string = "http://localhost:46657") {
    // accept host.name:port and assume http protocol
    this.url = hasProtocol(url) ? url : "http://" + url;
  }

  public disconnect(): void {
    // nothing to be done
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    // make sure we set the origin header properly, seems not to be set
    // in karma tests....
    const response = await http("POST", this.url, request);
    return throwIfError(response);
  }
}

/**
 * HttpUriClient encodes the whole request as an URI to be submitted
 * as a HTTP GET request.
 *
 * This is only meant for testing or quick status/health checks
 *
 * @see https://tendermint.github.io/slate/#uri-http
 */
export class HttpUriClient implements RpcClient {
  protected readonly baseUrl: string;

  constructor(baseUrl: string = "http://localhost:46657") {
    this.baseUrl = hasProtocol(baseUrl) ? baseUrl : "http://" + baseUrl;
  }

  public disconnect(): void {
    // nothing to be done
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    if (request.params && Object.keys(request.params).length !== 0) {
      throw new Error(`HttpUriClient doesn't support passing params: ${request.params}`);
    }
    const url = `${this.baseUrl}/${request.method}`;
    const response = await http("GET", url);
    return throwIfError(response);
  }
}
