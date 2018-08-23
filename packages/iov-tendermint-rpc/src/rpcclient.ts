/* tslint:disable:readonly-keyword readonly-array no-object-mutation */
import axios from "axios";
import EventEmitter from "events";
import { Listener, Producer, Stream } from "xstream";

import {
  ifError,
  JsonRpcEvent,
  JsonRpcRequest,
  JsonRpcResponse,
  JsonRpcSuccess,
  throwIfError,
} from "./common";
import { QueueingWebSocket } from "./queueingwebsocket";

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
  // Used to distribute socket events to interested listeners. Event types:
  // "<id>"        response messages to the request with <id>
  // "<id>#event"  events following the subscription request with <id>
  // "close"       when the socket has been closed in a more or less clean way
  // "error"       when an error occured
  private readonly bridge: EventEmitter;

  private readonly url: string;
  private readonly socket: QueueingWebSocket;

  constructor(baseUrl: string = "ws://localhost:46657", onError: (err: any) => void = defaultErrorHandler) {
    // accept host.name:port and assume ws protocol
    const path = "/websocket";
    const cleanBaseUrl = hasProtocol(baseUrl) ? baseUrl : "ws://" + baseUrl;
    this.url = cleanBaseUrl + path;

    this.bridge = new EventEmitter();
    this.bridge.on("error", onError);

    this.socket = new QueueingWebSocket(
      this.url,
      message => {
        // this should never happen, but I want an alert if it does
        if (message.type !== "message") {
          this.bridge.emit("error", `Unexcepted message type on websocket: ${message.type}`);
        }
        const data = JSON.parse(message.data.toString());
        this.bridge.emit(data.id, data);
      },
      error => this.bridge.emit("error", error),
      () => 0,
      closeEvent => {
        if (closeEvent.wasClean) {
          this.bridge.emit("close");
        } else {
          const debug = `clean: ${closeEvent.wasClean}, code: ${closeEvent.code}`;
          this.bridge.emit("error", `Websocket closed (${debug})`);
        }
      },
    );
    this.socket.connect();
  }

  public async execute(request: JsonRpcRequest): Promise<JsonRpcSuccess> {
    const responsePromise = this.responseForRequestId(request.id).then(throwIfError);

    await this.socket.connected;
    await this.socket.sendNow(JSON.stringify(request));

    const response = await responsePromise;
    return response;
  }

  public listen(request: JsonRpcRequest): Stream<JsonRpcEvent> {
    if (request.method !== "subscribe") {
      throw new Error(`Request method must be "subscribe" to start event listening`);
    }
    const producer = new RpcEventProducer(request, this.socket, this.bridge);
    return Stream.create(producer);
  }

  public disconnect(): void {
    this.socket.disconnect();
  }

  protected responseForRequestId(id: string): Promise<JsonRpcResponse> {
    return new Promise((resolve, reject) => {
      // only one of the two listeners should fire, and it will
      // deregister the other so as not to cause a leak.

      // this will fire on a response (success or error)
      const good = this.bridge.once(id, data => {
        bad.removeAllListeners();
        resolve(data);
      });
      // this will fire in case the websocket errors/disconnects
      const bad = this.bridge.once("error", err => {
        good.removeAllListeners();
        reject(err);
      });
    });
  }
}

class RpcEventProducer implements Producer<JsonRpcEvent> {
  private readonly request: JsonRpcRequest;
  private readonly socket: QueueingWebSocket;
  private readonly bridge: EventEmitter;

  private running: boolean = false;
  private subscriptions: EventEmitter[] = [];

  constructor(request: JsonRpcRequest, socket: QueueingWebSocket, bridge: EventEmitter) {
    this.request = request;
    this.socket = socket;
    this.bridge = bridge;
  }

  /**
   * Implementation of Producer.start
   */
  public start(listener: Listener<JsonRpcEvent>): void {
    if (this.running) {
      throw Error("Already started. Please stop first before restarting.");
    }
    this.running = true;

    this.connectToClient(listener);

    this.socket.connected.then(() => {
      this.socket.sendNow(JSON.stringify(this.request)).catch(error => {
        listener.error(error);
      });
    });
  }

  /**
   * Implementation of Producer.stop
   *
   * Called by the stream when the stream's last listener stopped listening
   * or when the producer completed.
   */
  public stop(): void {
    this.running = false;
    // Tell the server we are done in order to save resources. We cannot wait for the result.
    // This may fail when socket connection is not open, thus ignore errors in send
    const endRequest: JsonRpcRequest = { ...this.request, method: "unsubscribe" };
    this.socket.sendNow(JSON.stringify(endRequest)).catch(_ => 0);
  }

  protected connectToClient(listener: Listener<JsonRpcEvent>): void {
    // this should unsubscribe itself, so doesn't need to be removed explicitly
    const idSubscription = this.bridge.once(this.request.id, data => {
      const err = ifError(data);
      if (err) {
        this.closeSubscriptions();
        listener.error(err);
      }
    });

    // this will fire on a response (success or error)
    // Tendermint adds an "#event" suffix for events that follow a previous subscription
    // https://github.com/tendermint/tendermint/blob/v0.23.0/rpc/core/events.go#L107
    const idEventSubscription = this.bridge.on(this.request.id + "#event", data => {
      const err = ifError(data);
      if (err) {
        this.closeSubscriptions();
        listener.error(err);
      } else {
        const result = (data as JsonRpcSuccess).result;
        listener.next(result as JsonRpcEvent);
      }
    });

    // this will fire in case the websocket disconnects cleanly
    const closeSubscription = this.bridge.once("close", () => {
      this.closeSubscriptions();
      listener.complete();
    });

    // this will fire in case the websocket errors/disconnects
    const errorSubscription = this.bridge.once("error", err => {
      this.closeSubscriptions();
      listener.error(err);
    });

    this.subscriptions.push(idSubscription, idEventSubscription, closeSubscription, errorSubscription);
  }

  protected closeSubscriptions(): void {
    for (const subscription of this.subscriptions) {
      subscription.removeAllListeners();
    }
    // clear unused subscriptions
    this.subscriptions = [];
  }
}
