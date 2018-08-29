import { Stream } from "xstream";
import { Event, Message } from "./messages";
export declare type Connector = () => Connection;
export interface Connection {
    readonly send: (msg: Message) => void;
    readonly receive: Stream<Message>;
    readonly disconnect: () => void;
}
export interface ClientInterface {
    readonly request: (method: string, params: any) => Promise<any>;
    readonly subscribe: (query: string) => Stream<Event>;
}
export declare class Client implements ClientInterface {
    private readonly connection;
    constructor(connection: Connection);
    request(method: string, params: any): Promise<any>;
    subscribe(query: string): Stream<Event>;
    private receiver;
}
export interface Handler {
    readonly handleRequest: (method: string, params: any) => Promise<any>;
    readonly handleSubscribe: (query: string) => Stream<Event>;
}
export declare class Server {
    private readonly connection;
    private readonly handler;
    constructor(connection: Connection, handler: Handler);
    private listen;
    private handleMessage;
}
