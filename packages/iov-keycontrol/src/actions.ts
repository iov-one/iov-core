import {
  Nonce,
  PasswordString,
  PublicKeyBundle,
  SignedTransaction,
  UnsignedTransaction,
  UsernameString,
} from "@iov/types";
import { KeyringName } from "./keyring";

export const enum KeyActionType {
  ADD_USER = "ADD_USER",
  REMOVE_USER = "REMOVE_USER",
  UNLOCK_USER = "UNLOCK_USER",
  LOCK_USER = "LOCK_USER",
  CREATE_ACCOUNT = "CREATE_ACCOUNT",
  SET_ACCOUNT_NAME = "SET_ACCOUNT_NAME",
  SIGN_TRANSACTION = "SIGN_TRANSACTION",
  VERIFY_TRANSACTION = "VERIFY_TRANSACTION",
}

export type KeyAction =
  | AddUserAction
  | RemoveUserAction
  | UnlockUserAction
  | LockUserAction
  | CreateAccountAction
  | SetAccountNameAction
  | SignTransactionAction
  | VerifyTransactionAction;

// We can get multiple AddUserEvents in a row in order to
// provide us with the current user list.
//
// Or do we really want a UserListEvent that just updates the list???
export interface AddUserAction {
  readonly type: KeyActionType.ADD_USER;
  readonly user: UsernameString;
  readonly password: PasswordString;
  readonly keyring: KeyringName;
}

export interface RemoveUserAction {
  readonly type: KeyActionType.REMOVE_USER;
  readonly user: UsernameString;
  readonly password: PasswordString;
}

export interface UnlockUserAction {
  readonly type: KeyActionType.UNLOCK_USER;
  readonly user: UsernameString;
  readonly password: PasswordString;
}

export interface LockUserAction {
  readonly type: KeyActionType.LOCK_USER;
  readonly user: UsernameString;
}

export interface CreateAccountAction {
  readonly type: KeyActionType.CREATE_ACCOUNT;
  readonly user: UsernameString;
}

export interface SetAccountNameAction {
  readonly type: KeyActionType.SET_ACCOUNT_NAME;
  readonly user: UsernameString;
  readonly publicKey: PublicKeyBundle;
  readonly name: string;
}

export interface SignTransactionAction {
  readonly type: KeyActionType.SIGN_TRANSACTION;
  readonly user: UsernameString;
  readonly account: PublicKeyBundle;
  readonly tx: UnsignedTransaction;
  readonly nonce: Nonce;
}

export interface VerifyTransactionAction {
  readonly type: KeyActionType.VERIFY_TRANSACTION;
  readonly tx: SignedTransaction;
}
