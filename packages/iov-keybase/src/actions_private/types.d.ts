import {
  AddressString,
  ClientNameString,
  ClientTokenString,
  NonceBuffer,
  PrivateKeyString,
  PublicKeyString,
  SeedString,
  Transaction,
  TTLBuffer
} from "@iov/types";
import { Stream } from "xstream";
import { PasswordString, UsernameString } from "../accounts/types";

// do we listen as one giant blob, or a separate listener
// for each subset of the state tree
type StateWatcher = () => Stream<KeybaseState>;
type UserWatcher = () => Stream<UsernameString>;

// this makes sense for eg. create account, which will just
// show response by updating state sent to StateWatcher
// type PrivateDispatcher = (action: PrivateAction) => void;

// this makes sense for signmessage, which wants to pass the
// return value into another pipe.
// unless we have some WatchAllSignedMessages() stream....

// Do we have one generate function, or specific types ones?
// Can we use overloading to define all possible
// request/response pairs on one dispath function
type PrivateDispatcher = (action: PrivateAction) => Promise<any>;
type SignDispatcher = (action: SignTransaction) => Promise<Transaction>;
type ImportDispatcher = (action: ImportPrivateKey) => Promise<true>; // ??

interface KeybaseState {
  readonly users: ReadonlyArray<UsernameString>;
  readonly activeKey: PublicKeyString | null;
}

export const enum PrivateActionType {
  LIST_USERS = "LIST_USERS", // looks at current state, really a query
  UNLOCK_USER = "UNLOCK_USER",
  CREATE_USER = "CREATE_USER",
  RESTORE_USER = "RESTORE_USER",
  IMPORT_PRIVATE_KEY = "IMPORT_PRIVATE_KEY",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  EXPORT_USER = "EXPORT_USER",
  SIGN_TRANSACTION = "SIGN_TRANSACTION",
  SET_ACTIVE_KEY = "SET_ACTIVE_KEY",
  GRANT_STORE_ACCESS = "GRANT_STORE_ACCESS"
}

export interface ListUsers {
  readonly type: PrivateActionType.LIST_USERS;
}

export interface UnlockUser {
  readonly type: PrivateActionType.UNLOCK_USER;
  readonly username: UsernameString;
  readonly password: PasswordString;
}

export interface CreateUser {
  readonly type: PrivateActionType.CREATE_USER;
  readonly username: UsernameString;
  readonly password: PasswordString;
  readonly options?: {};
}

export interface RestoreUser {
  readonly type: PrivateActionType.RESTORE_USER;
  readonly username: UsernameString;
  readonly password: PasswordString;
  readonly seed: SeedString;
}

export interface ImportPrivateKey {
  readonly type: PrivateActionType.IMPORT_PRIVATE_KEY;
  readonly username: UsernameString;
  readonly privateKey: PrivateKeyString;
}

export interface AddAccount {
  readonly type: PrivateActionType.ADD_ACCOUNT;
  readonly options?: {};
}

export interface ExportUser {
  readonly type: PrivateActionType.EXPORT_USER;
  readonly username: UsernameString;
  readonly password: PasswordString;
  readonly options?: {};
}

export interface SignTransaction {
  readonly type: PrivateActionType.SIGN_TRANSACTION;
  readonly publicKey: PublicKeyString;
  readonly transaction: Transaction;
  readonly nonce: NonceBuffer | null;
  readonly ttl: TTLBuffer | null;
}

export interface SetActiveKey {
  readonly type: PrivateActionType.SET_ACTIVE_KEY;
  readonly index: number;
}

export interface GrantStoreAccess {
  readonly type: PrivateActionType.GRANT_STORE_ACCESS;
  readonly publicKey: PublicKeyString;
  readonly origin: ClientNameString;
  readonly token: ClientTokenString;
}

export type PrivateAction =
  | ListUsers
  | UnlockUser
  | CreateUser
  | RestoreUser
  | ImportPrivateKey
  | AddAccount
  | ExportUser
  | SignTransaction
  | SetActiveKey
  | GrantStoreAccess;
