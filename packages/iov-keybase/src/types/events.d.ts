import { PublicKeyString, TransactionIDString } from "@iov/types";
import { Observable } from "xstream";

// SubscribeChangeEvent is a function in my world, it makes no change to state
// on the keybase, but rather subscribes to a stream of events
export type SubscribeChanges = () => Observable<PublicEvent>;

// Placeholder until we figure out what type this should be
export type TransactionError = any;

export const enum PublicEventType {
  PUBLIC_KEY_CHANGED = "PUBLIC_KEY_CHANGED",
  SEND_TRANSACTION_SUCCEEDED = "SEND_TRANSACTION_SUCCEEDED",
  SEND_TRANSACTION_FAILED = "SEND_TRANSACTION_FAILED",
  WALLET_LOCKED = "WALLET_LOCKED"
}

export interface PublicKeyChangedEvent {
  readonly type: PublicEventType.PUBLIC_KEY_CHANGED;
  readonly key: PublicKeyString;
}

export interface SendTransactionSuccessEvent {
  readonly type: PublicEventType.SEND_TRANSACTION_SUCCEEDED;
  readonly txId: TransactionIDString;
  readonly height: number;
  readonly data?: Uint8Array;
}

export interface SendTransactionFailureEvent {
  readonly type: PublicEventType.SEND_TRANSACTION_FAILED;
  readonly txId: TransactionIDString;
  readonly error: TransactionError;
}

export interface WalletLockedEvent {
  readonly type: PublicEventType.WALLET_LOCKED;
}

export type PublicEvent =
  | PublicKeyChangedEvent
  | SendTransactionFailureEvent
  | SendTransactionSuccessEvent
  | WalletLockedEvent;
