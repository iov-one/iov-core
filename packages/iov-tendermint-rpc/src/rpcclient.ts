/* tslint:disable:readonly-keyword readonly-array no-object-mutation */
import axios from "axios";
import EventEmitter from "events";
import WebSocket from "isomorphic-ws";
import { Listener, Producer, Stream } from "xstream";

import {
  ifError,
  JsonRpcEvent,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccess,
  throwIfError,
} from "./common";

export interface RpcClient {
  readonly execute: (request: JsonRpcRequest) => Promise<JsonRpcSuccess>;
}

export interface RpcStreamingClient extends RpcClient {
  readonly listen: (request: JsonRpcRequest) => Stream<JsonRpcEvent>;
}

export function getWindow(): any | undefined {
  return inBrowser() ? (window as any) : undefined;
}

export function inBrowser(): boolean {
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

function defaultErrorHandler(error: any): never {
  throw error;
}

// make sure we set the origin header properly, seems not to be set
// in karma tests....
export function getOriginConfig(): any {
  const w = getWindow();
  return w ? { headers: { Origin: w.origin, Referer: `${w.origin}/` } } : undefined;
}

export function hasProtocol(url: string): boolean {
  return url.search("://") !== -1;
}

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

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    if (request.params && Object.keys(request.params).length !== 0) {
      throw new Error(`HttpUriClient doesn't support passing params: ${request.params}`);
    }
    const url = `${this.baseUrl}/${request.method}`;
    const response = await http("GET", url);
    return throwIfError(response);
  }
}

// WebsocketClient makes calls over websocket
// TODO: support event subscriptions as well
// TODO: error handling on disconnect
export class WebsocketClient implements RpcStreamingClient {
  public readonly switch: EventEmitter;

  protected readonly url: string;
  protected readonly ws: WebSocket;

  // connected is resolved as soon as the websocket is connected
  // TODO: use MemoryStream and support reconnects
  protected readonly connected: Promise<boolean>;

  constructor(baseUrl: string = "ws://localhost:46657", onError: (err: any) => void = defaultErrorHandler) {
    // accept host.name:port and assume ws protocol
    const path = "/websocket";
    const cleanBaseUrl = hasProtocol(baseUrl) ? baseUrl : "ws://" + baseUrl;
    this.url = cleanBaseUrl + path;

    this.switch = new EventEmitter();
    this.ws = new WebSocket(this.url);
    this.connected = new Promise(resolve => {
      // tslint:disable-next-line:no-object-mutation
      this.ws.onopen = () => resolve(true);
    });
    this.connect();
    this.switch.on("error", onError);
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

  public listen(request: JsonRpcRequest): Stream<JsonRpcEvent> {
    const producer = new RpcEventProducer(request, this);
    return Stream.create(producer);
  }

  public send(request: JsonRpcRequest): void {
    this.connected
      .then(() => this.ws.send(JSON.stringify(request)))
      .catch(err => this.switch.emit("errror", err));
  }

  protected connect(): void {
    // tslint:disable-next-line:no-object-mutation
    this.ws.onerror = err => this.switch.emit("error", err);
    // tslint:disable-next-line:no-object-mutation
    this.ws.onclose = () => this.switch.emit("error", "Websocket closed");
    // tslint:disable-next-line:no-object-mutation
    this.ws.onmessage = msg => {
      // this should never happen, but I want an alert if it does
      if (msg.type !== "message") {
        throw new Error(`Unexcepted message type on websocket: ${msg.type}`);
      }
      const data = JSON.parse(msg.data.toString());
      this.switch.emit(data.id, data);
    };
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

class RpcEventProducer implements Producer<JsonRpcEvent> {
  private readonly request: JsonRpcRequest;
  private readonly client: WebsocketClient;

  private listener: Listener<JsonRpcEvent> | undefined;
  private subscriptions: EventEmitter[] = [];

  constructor(request: JsonRpcRequest, client: WebsocketClient) {
    this.request = request;
    this.client = client;
  }

  /**
   * Implementation of Producer.start
   */
  public start(listener: Listener<JsonRpcEvent>): void {
    if (this.listener) {
      throw Error("Already started. Please stop first before restarting.");
    }
    this.listener = listener;
    this.subscribeEvents();

    this.client.send(this.request);
  }

  /**
   * Implementation of Producer.stop
   */
  public stop(): void {
    this.closeSubscriptions();
    this.listener!.complete();
    this.listener = undefined;

    // Tell the server we are done in order to save resources. We cannot wait for the result.
    const endRequest: JsonRpcRequest = { ...this.request, method: "unsubscribe" };
    this.client.send(endRequest);
  }

  protected subscribeEvents(): void {
    // this should unsubscribe itself, so doesn't need to be removed explicitly
    const idSubscription = this.client.switch.once(this.request.id, data => {
      const err = ifError(data);
      if (err) {
        this.closeSubscriptions();
        this.listener!.error(err);
      }
    });

    // this will fire on a response (success or error)
    const idEventSubscription = this.client.switch.on(this.request.id + "#event", data => {
      const err = ifError(data);
      if (err) {
        this.closeSubscriptions();
        this.listener!.error(err);
      } else {
        const result = (data as JsonRpcSuccess).result;
        this.listener!.next(result as JsonRpcEvent);
      }
    });

    // this will fire in case the websocket errors/disconnects
    const idDoneSubscription = this.client.switch.once(this.request.id + "#done", () => {
      this.closeSubscriptions();
      this.listener!.complete();
    });

    // this will fire in case the websocket errors/disconnects
    const errorSubscription = this.client.switch.once("error", err => {
      this.closeSubscriptions();
      this.listener!.error(err);
    });

    this.subscriptions.push(idSubscription, idEventSubscription, idDoneSubscription, errorSubscription);
  }

  protected closeSubscriptions(): void {
    for (const subscription of this.subscriptions) {
      subscription.removeAllListeners();
    }
    // clear unused subscriptions
    this.subscriptions = [];
  }
}
