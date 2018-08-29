import { Stream } from "xstream";
import { Event, Message } from "./messages";
export declare type Connector = () => Connection;
export interface Connection {
    readonly send: (msg: Message) => void;
    readonly receive: Stream<Message>;
}
export interface Client {
    readonly request: (method: string, params: any) => Promise<any>;
    readonly subscribe: (query: string) => Stream<Event>;
}
export interface Server {
    readonly handleRequest: (method: string, params: any) => Promise<any>;
    readonly handleSubscribe: (query: string) => Stream<Event>;
}
