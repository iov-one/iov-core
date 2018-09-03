/*
This is a proposal that goes along with connection.ts and proxy.ts.

It defines a generic message-based communication layer,
inspired by JsonRpc.

Much code was copied from the @iov/tendermint-rpc common.ts file,
but modified for our needs
*/

import { As } from "type-tagger";

export type MsgId = string & As<"msgid">;

export const format = "iov/0.1";

export interface Envelope {
  readonly format: "iov/0.1";
  readonly id: MsgId;
}

export enum MessageKind {
  REQUEST = "request",
  RESPONSE = "response",
  ERROR = "error",
  EVENT = "event",
}

export const subscribe = "subscribe";
export const unsubscribe = "unsubscribe";

// TODO: some sort of HandshakeMessage??

export type Message = RequestMessage | ResponseMessage | ErrorMessage | EventMessage;

export interface RequestMessage extends Envelope {
  readonly kind: MessageKind.REQUEST;
  readonly method: string;
  readonly params: any;
}

// ResponseMessage must have same id as RequestMessage
export interface ResponseMessage extends Envelope {
  readonly kind: MessageKind.RESPONSE;
  readonly result: any;
}

// ErrorMessage should have same id as RequestMessage if request failed
// A general connection failure should execute as an error on
// the steam, not a message type
export interface ErrorMessage extends Envelope {
  readonly kind: MessageKind.ERROR;
  readonly error: {
    readonly code: number;
    readonly message: string;
  };
}

// RequestMessage used for controlling event streams
export interface SubscribeMessage extends RequestMessage {
  readonly method: "subscribe";
  readonly params: {
    readonly query: string;
    readonly subscriptionId: MsgId;
  };
}

// RequestMessage used for controlling event streams
export interface UnsubscribeMessage extends RequestMessage {
  readonly method: "unsubscribe";
  readonly params: {
    readonly subscriptionId: MsgId;
  };
}

// EventMessage may have id equal to subscriptionId if it was requested,
// Or another id for a general, unsolicited event
export interface EventMessage extends Envelope {
  readonly kind: MessageKind.EVENT;
  readonly event: Event;
}

export interface Event {
  readonly type: string;
  readonly data: any;
}

export const envelope = (): Envelope => ({ format, id: randomId() });

const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// generate a random alphanumeric character
export const randomChar = (): string => chars[Math.floor(Math.random() * chars.length)];
export const randomId = (): MsgId =>
  Array.from({ length: 12 })
    .map(() => randomChar())
    .join("") as MsgId;
