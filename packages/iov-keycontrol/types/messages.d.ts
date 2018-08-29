import { As } from "type-tagger";
export declare type MsgId = string & As<"msgid">;
export declare const format = "iov/0.1";
export interface Envelope {
    readonly format: "iov/0.1";
    readonly id: MsgId;
}
export declare enum MessageKind {
    REQUEST = "request",
    RESPONSE = "response",
    ERROR = "error",
    EVENT = "event"
}
export declare type Message = RequestMessage | ResponseMessage | ErrorMessage | EventMessage;
export interface RequestMessage extends Envelope {
    readonly kind: MessageKind.REQUEST;
    readonly method: string;
    readonly params: any;
}
export interface ResponseMessage extends Envelope {
    readonly kind: MessageKind.RESPONSE;
    readonly result: any;
}
export interface ErrorMessage extends Envelope {
    readonly kind: MessageKind.ERROR;
    readonly error: {
        readonly code: number;
        readonly message: string;
    };
}
export interface EventMessage extends Envelope {
    readonly kind: MessageKind.EVENT;
    readonly eventType: string;
    readonly event: any;
}
export declare const envelope: () => Envelope;
export declare const randomChar: () => string;
export declare const randomId: () => MsgId;
