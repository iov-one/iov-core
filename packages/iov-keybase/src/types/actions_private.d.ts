import {
  AddressString,
  ClientNameString,
  ClientTokenString,
  PasswordString,
  PrivateKeyString,
  PublicKeyString,
  SeedString,
  Transaction,
  TTLBytes,
  UsernameString,
} from "@iov/types";

export const enum PrivateActionType {
  UNLOCK_USER = "UNLOCK_USER",
  CREATE_USER = "CREATE_USER",
  RESTORE_USER = "RESTORE_USER",
  IMPORT_PRIVATE_KEY = "IMPORT_PRIVATE_KEY",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  EXPORT_USER = "EXPORT_USER",
  SIGN_TRANSACTION = "SIGN_TRANSACTION",
  SET_ACTIVE_KEY = "SET_ACTIVE_KEY",
  GRANT_STORE_ACCESS = "GRANT_STORE_ACCESS",
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
  readonly ttl: TTLBytes | null;
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
  | UnlockUser
  | CreateUser
  | RestoreUser
  | ImportPrivateKey
  | AddAccount
  | ExportUser
  | SignTransaction
  | SetActiveKey
  | GrantStoreAccess;
