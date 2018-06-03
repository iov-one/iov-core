import { Transaction } from "@iov/types";
import { PasswordString, UsernameString } from "../accounts/types";

export const enum PublicActionType {
  REQUEST_API_ACCESS = "REQUEST_API_ACCESS",
  GET_CURRENT_ACCOUNT = "GET_CURRENT_ACCOUNT",
  CHANGE_EVENT = "CHANGE_EVENT",
  REQUEST_SIGN_TX = "REQUEST_SIGN_TX",
  REQUEST_SIGN_MESSAGE = "REQUEST_SIGN_MESSAGE"
}

export interface RequestAPIAccess {
  readonly type: PublicActionType.REQUEST_API_ACCESS;
  readonly options?: {};
}

export interface GetCurrentAccount {
  readonly type: PublicActionType.GET_CURRENT_ACCOUNT;
}

export const enum PublicEventType {
  ACCESS_GRANTED = "ACCESS_GRANTED",
  PUBLIC_KEY_RELEASED = "PUBLIC_KEY_RELEASED",
  WALLET_LOCKED = "WALLET_LOCKED"
}

export interface ChangeEvent {
  readonly type: PublicActionType.CHANGE_EVENT;
  readonly event: PublicEventType;
  // no-mixed-interface protects against OO-style methods, but this is passing a handler
  // tslint:disable-next-line no-mixed-interface
  readonly handler: () => any;
}

export interface RequestSignTransaction {
  readonly type: PublicActionType.REQUEST_SIGN_TX;
  readonly transaction: Transaction;
}

export interface RequestSignMessage {
  readonly type: PublicActionType.REQUEST_SIGN_MESSAGE;
  readonly message: Uint8Array;
}

export type PublicAction =
  | RequestAPIAccess
  | GetCurrentAccount
  | ChangeEvent
  | RequestSignTransaction
  | RequestSignMessage;
