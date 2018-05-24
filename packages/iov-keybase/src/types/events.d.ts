import { PublicKeyString, TransactionIDString } from "@iov/types";
import { Observable } from "xstream";

// SubscribeChangeEvent is a function in my world, it makes no change to state
// on the keybase, but rather subscribes to a stream of events
export type SubscribeChanges = () => Observable<PublicEvent>;

export const enum PublicEventType {
  PUBLIC_KEY_CHANGED = "PUBLIC_KEY_CHANGED",
  SEND_TRANSACTION_SUCCESS = "SEND_TRANSACTION_SUCCESS",
  SEND_TRANSACTION_FAILURE = "SEND_TRANSACTION_FAILURE",
  WALLET_LOCKED = "WALLET_LOCKED"
}

export interface PublicKeyChangedEvent {
  readonly type: PublicEventType.PUBLIC_KEY_CHANGED;
  readonly key: PublicKeyString;
}

export interface SendTransactionSuccessEvent {
  readonly type: PublicEventType.SEND_TRANSACTION_SUCCESS;
  readonly txId: TransactionIDString;
  readonly data: Uint8Array;
  readonly height: number;
}

export interface SendTransactionFailureEvent {
  readonly type: PublicEventType.SEND_TRANSACTION_FAILURE;
  readonly txId: TransactionIDString;
  readonly error: any;
}

export interface WalletLockedEvent {
  readonly type: PublicEventType.WALLET_LOCKED;
}

export type PublicEvent =
  | PublicKeyChangedEvent
  | SendTransactionFailureEvent
  | SendTransactionSuccessEvent
  | WalletLockedEvent;
