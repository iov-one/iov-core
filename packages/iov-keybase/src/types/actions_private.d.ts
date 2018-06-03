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
import { PasswordString, UsernameString } from "./accounts";

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
