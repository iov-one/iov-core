import { SignableTransaction, UsernameString } from "@iov/types";

import { Profile } from "./keycontroller";
import { PublicIdentity } from "./keyring";

export const enum KeyEventType {
  ADD_PROFILE = "ADD_PROFILE",
  REMOVE_PROFILE = "REMOVE_PROFILE",
  UNLOCK_PROFILE = "UNLOCK_PROFILE",
  LOCK_PROFILE = "LOCK_PROFILE",
  MODIFY_PROFILE = "MODIFY_PROFILE",
  SIGNED_TRANSACTION = "SIGNED_TRANSACTION",
  VERIFIED_TRANSACTION = "VERIFIED_TRANSACTION",
}

export type KeyEvent =
  | AddProfileEvent
  | RemoveProfileEvent
  | UnlockProfileEvent
  | ModifyProfileEvent
  | LockProfileEvent
  | SignedTransactionEvent
  | VerifiedTransactionEvent;

// We can get multiple AddProfileEvents in a row in order to
// provide us with the current user list.
//
// Or do we really want a UserListEvent that just updates the list???
export interface AddProfileEvent {
  readonly type: KeyEventType.ADD_PROFILE;
  readonly user: UsernameString;
}

export interface RemoveProfileEvent {
  readonly type: KeyEventType.REMOVE_PROFILE;
  readonly user: UsernameString;
}

export interface UnlockProfileEvent {
  readonly type: KeyEventType.UNLOCK_PROFILE;
  readonly profile: Profile;
}

// On any change to this unlocked account, send the new state.
// This involves both naming an account, as well as adding
// new identities.
//
// Or shall we make separate events to each modification
// (which are smaller, but may be harder to track)?
export interface ModifyProfileEvent {
  readonly type: KeyEventType.MODIFY_PROFILE;
  readonly user: UsernameString;
  readonly identities: ReadonlyArray<PublicIdentity>;
}

export interface LockProfileEvent {
  readonly type: KeyEventType.LOCK_PROFILE;
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
