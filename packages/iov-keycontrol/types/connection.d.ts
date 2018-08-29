import { Stream } from "xstream";
import { Message } from "./messages";
export interface Connection {
    readonly send: (msg: Message) => void;
    readonly receive: Stream<Message>;
}
export declare type Connector = () => Connection;
