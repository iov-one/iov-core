import axios from "axios";
import EventEmitter from "events";
import WebSocket from "isomorphic-ws";

import { JsonRpcRequest, JsonRpcResponse, JsonRpcSuccess, throwIfError } from "./common";

export interface RpcClient {
  readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
}

export const getWindow = (): any | undefined => (inBrowser() ? (window as any) : undefined);
export const inBrowser = (): boolean => typeof window === "object";

const filterBadStatus = (res: Response) => {
  if (res.status >= 400) {
    throw new Error(`Bad status on response: ${res.status}`);
  }
  return res;
};

// post uses fetch in browser and axios in node,
// was having weird issues with axios in brower
const http = (method: string, url: string, request?: any): Promise<any> => {
  if (inBrowser()) {
    const body = request ? JSON.stringify(request) : undefined;
    // TODO: handle non 4xx and 5xx with throwing error
    return fetch(url, { method, body })
      .then(filterBadStatus)
      .then(res => res.json());
  } else {
    return axios.request({ url, method, data: request }).then(res => res.data) as Promise<any>;
  }
};

// make sure we set the origin header properly, seems not to be set
// in karma tests....
export const getOriginConfig = () => {
  const w = getWindow();
  return w ? { headers: { Origin: w.origin, Referer: `${w.origin}/` } } : undefined;
};

export const hasProtocol = (url: string) => url.search("://") !== -1;

export class HttpClient implements RpcClient {
  protected readonly url: string;

  constructor(url: string = "http://localhost:46657") {
    // accept host.name:port and assume http protocol
    this.url = hasProtocol(url) ? url : "http://" + url;
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
    this.url = hasProtocol(url) ? url : "http://" + url;
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

// WebsocketClient makes calls over websocket
// TODO: support event subscriptions as well
// TODO: error handling on disconnect
export class WebsocketClient implements RpcClient {
  protected readonly url: string;
  protected readonly ws: WebSocket;
  protected readonly switch: EventEmitter;

  // connected is resolved as soon as the websocket is connected
  // TODO: use MemoryStream and support reconnects
  protected readonly connected: Promise<boolean>;

  constructor(url: string = "ws://localhost:46657", path: string = "/websocket") {
    // accept host.name:port and assume ws protocol
    const cleanUrl = hasProtocol(url) ? url : "ws://" + url;
    this.url = cleanUrl + path;

    this.switch = new EventEmitter();
    this.ws = this.connect();
    this.connected = new Promise(resolve => {
      this.ws.once("open", () => resolve(true));
    });
    this.switch.on("error", console.log);
  }

  public execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    const promise = this.subscribe(request.id).then(throwIfError);
    // send as soon as connected
    this.connected
      .then(() => this.ws.send(JSON.stringify(request)))
      // Is there a way to be more targetted with errors?
      // So this just kills the execute promise, not anything else?
      .catch(err => this.switch.emit("errror", err));
    return promise;
  }

  protected connect(): WebSocket {
    const ws = new WebSocket(this.url);
    ws.on("error", err => this.switch.emit("error", err));
    ws.on("close", () => this.switch.emit("error", "Websocket closed"));
    ws.on("message", msg => {
      const data = JSON.parse(msg.toString());
      this.switch.emit(data.id, data);
    });
    return ws;
  }

  protected subscribe(id: string): Promise<JsonRpcResponse> {
    return new Promise((resolve, reject) => {
      // only one of the two listeners should fire, and it will
      // deregister the other so as not to cause a leak.

      // this will fire on a response (success or error)
      const good = this.switch.once(id, data => {
        bad.removeAllListeners();
        resolve(data);
      });
      // this will fire in case the websocket errors/disconnects
      const bad = this.switch.once("error", err => {
        good.removeAllListeners();
        reject(err);
      });
    });
  }
}
