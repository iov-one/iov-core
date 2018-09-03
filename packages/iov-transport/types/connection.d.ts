import { Listener, Producer, Stream } from "xstream";
import { Event, Message } from "./messages";
export declare type Connector = () => Connection;
export interface Connection {
    readonly send: (msg: Message) => void;
    readonly receive: Stream<Message>;
    readonly disconnect: () => void;
}
export declare class SendProducer<T> implements Producer<T> {
    private listener;
    start(listener: Listener<T>): void;
    stop(): void;
    send(msg: T): void;
}
export declare type EventProducer = SendProducer<Event>;
export declare type MessageProducer = SendProducer<Message>;
export declare const localConnectionPair: () => [Connection, Connection];
