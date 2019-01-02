import axios from "axios";

import { JsonRpcRequest, JsonRpcSuccess, throwIfError } from "../jsonrpc";
import { hasProtocol, RpcClient } from "./rpcclient";

// Global symbols in some environments
// https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch
declare const fetch: any | undefined;

function filterBadStatus(res: any): any {
  if (res.status >= 400) {
    throw new Error(`Bad status on response: ${res.status}`);
  }
  return res;
}

/**
 * Helper to work around missing CORS support in Tendermint (https://github.com/tendermint/tendermint/pull/2800)
 *
 * For some reason, fetch does not complain about missing server-side CORS support.
 */
function http(method: "POST", url: string, request?: any): Promise<any> {
  if (typeof fetch !== "undefined") {
    const body = request ? JSON.stringify(request) : undefined;
    return fetch(url, { method, body })
      .then(filterBadStatus)
      .then((res: any) => res.json());
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
    const response = await http("POST", this.url, request);
    return throwIfError(response);
  }
}
