import { Stream } from "xstream";
import { Connection } from "./connection";
import { Event } from "./messages";
export declare class Client {
    private readonly connection;
    private readonly resolvers;
    private readonly streams;
    constructor(connection: Connection);
    request(method: string, params: any): Promise<any>;
    subscribe(query: string): Stream<Event>;
    private listen;
    private handleMessage;
}
