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

// WebsocketClient makes calls over websocket
// TODO: support event subscriptions as well
// TODO: error handling on disconnect
export class WebsocketClient implements RpcClient {
  protected readonly url: string;
  protected readonly ws: WebSocket;
  protected readonly switch: EventEmitter;
  // connected is resolved as soon as the websocket is connected
  protected readonly connected: Promise<boolean>;

  constructor(url: string = "ws://localhost:46657", path: string = "/websocket") {
    this.url = url + path;
    this.switch = new EventEmitter();
    this.ws = this.connect();
    this.connected = new Promise(resolve => {
      this.ws.once("open", () => {
        // tslint:disable:no-console
        console.log("open");
        resolve(true);
      });
    });
    this.switch.on("error", console.log);
  }

  public execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    const promise = this.subscribe(request.id).then(throwIfError);
    // send as soon as connected
    this.connected
      .then(() => {
        console.log("send");
        this.ws.send(JSON.stringify(request));
      })
      .catch(console.log); // hmm.. when this errors?
    return promise;
  }

  protected connect(): WebSocket {
    const ws = new WebSocket(this.url);
    //  {
    //   origin: "https://websocket.org",
    // });
    ws.on("error", err => this.switch.emit("error", err));
    ws.on("close", () => this.switch.emit("error", "Websocket closed"));
    ws.on("message", msg => {
      // TODO: fix this up
      const data = JSON.parse(msg.toString());
      console.log("data ", data.id);
      this.switch.emit(data.id, data);
    });
    // TODO: pull this out?
    return ws;
  }

  protected subscribe(id: string): Promise<JsonRpcResponse> {
    // tslint:disable-next-line:no-let
    let resolved = false;
    console.log("subscribe ", id);
    return new Promise((resolve, reject) => {
      // FIXME-optimization: can we disable the other listener when one fires?

      // this will wait for a response (success or error)
      this.switch.once(id, data => {
        if (!resolved) {
          resolved = true;
          resolve(data);
        }
      });
      // this waits in case the websocket errors/disconnects
      this.switch.once("error", err => {
        if (!resolved) {
          resolved = true;
          reject(err);
        }
      });
    });
  }
}
