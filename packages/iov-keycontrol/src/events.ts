import { SignableTransaction, UsernameString } from "@iov/types";

import { NamedAccount } from "./keyring";

export const enum KeyEventType {
  ADD_USER = "ADD_USER",
  REMOVE_USER = "REMOVE_USER",
  UNLOCK_USER = "UNLOCK_USER",
  LOCK_USER = "LOCK_USER",
  MODIFY_USER = "MODIFY_USER",
  SIGNED_TRANSACTION = "SIGNED_TRANSACTION",
  VERIFIED_TRANSACTION = "VERIFIED_TRANSACTION",
}

export type KeyEvent =
  | AddUserEvent
  | RemoveUserEvent
  | UnlockUserEvent
  | ModifyUserEvent
  | LockUserEvent
  | SignedTransactionEvent
  | VerifiedTransactionEvent;

// We can get multiple AddUserEvents in a row in order to
// provide us with the current user list.
//
// Or do we really want a UserListEvent that just updates the list???
export interface AddUserEvent {
  readonly type: KeyEventType.ADD_USER;
  readonly user: UsernameString;
}

export interface RemoveUserEvent {
  readonly type: KeyEventType.REMOVE_USER;
  readonly user: UsernameString;
}

export interface UnlockUserEvent {
  readonly type: KeyEventType.UNLOCK_USER;
  readonly user: UsernameString;
  readonly accounts: ReadonlyArray<NamedAccount>;
}

// On any change to this unlocked account, send the new state.
// This involves both naming an account, as well as adding
// new accounts.
//
// Or shall we make separate events to each modification
// (which are smaller, but may be harder to track)?
export interface ModifyUserEvent {
  readonly type: KeyEventType.MODIFY_USER;
  readonly user: UsernameString;
  readonly accounts: ReadonlyArray<NamedAccount>;
}

export interface LockUserEvent {
  readonly type: KeyEventType.LOCK_USER;
  readonly user: UsernameString;
}

export interface SignedTransactionEvent {
  readonly type: KeyEventType.SIGNED_TRANSACTION;
  readonly tx: SignableTransaction;
}

export interface VerifiedTransactionEvent {
  readonly type: KeyEventType.VERIFIED_TRANSACTION;
  readonly tx: SignableTransaction;
  readonly valid: boolean;
}
