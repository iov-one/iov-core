import { Stream } from "xstream";
import { Connection } from "./connection";
import { Event } from "./messages";
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
