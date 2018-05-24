import {
  NonceBuffer,
  PrivateKeyString,
  PublicKeyString,
  SeedString,
  Transaction,
  TTLBuffer
} from "@iov/types";
import { PasswordString, UsernameString } from "./accounts";

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

export const enum PrivateActionType {
  LIST_USERS = "LIST_USERS",
  SUBMIT_PASSWORD = "SUBMIT_PASSWORD",
  CREATE_USER = "CREATE_USER",
  RESTORE_USER = "RESTORE_USER",
  IMPORT_PRIVATE_KEY = "IMPORT_PRIVATE_KEY",
  ADD_ACCOUNT = "ADD_ACCOUNT",
  EXPORT_USER = "EXPORT_USER",
  SIGN_TRANSACTION = "SIGN_TRANSACTION",
  VERIFY_TRANSACTION = "VERIFY_TRANSACTION",
  SIGN_MESSAGE = "SIGN_MESSAGE",
  VERIFY_MESSAGE = "VERIFY_MESSAGE",
  ENCRYPT_MESSAGE = "ENCRYPT_MESSAGE",
  DECRYPT_MESSAGE = "DECRYPT_MESSAGE",
  SET_ACTIVE_KEY = "SET_ACTIVE_KEY",
  GRANT_STORE_ACCESS = "GRANT_STORE_ACCESS"
}

export interface ListUsers {
  readonly type: PrivateActionType.LIST_USERS;
}

export interface SubmitPassword {
  readonly type: PrivateActionType.SUBMIT_PASSWORD;
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
  readonly password: PasswordString;
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

export interface VerifyTransaction {
  readonly type: PrivateActionType.VERIFY_TRANSACTION;
  readonly transaction: Transaction;
}

export interface SignMessage {
  readonly type: PrivateActionType.SIGN_MESSAGE;
  readonly message: Uint8Array;
  readonly publicKey: PublicKeyString;
}

export interface VerifyMessage {
  readonly type: PrivateActionType.VERIFY_MESSAGE;
  readonly message: Uint8Array;
  readonly publicKey: PublicKeyString;
  readonly signature: Uint8Array;
}

export interface EncryptMessage {
  readonly type: PrivateActionType.ENCRYPT_MESSAGE;
  readonly message: Uint8Array;
  readonly publicKey: PublicKeyString;
  readonly recipient: PublicKeyString;
}

export interface DecryptMessage {
  readonly type: PrivateActionType.DECRYPT_MESSAGE;
  readonly message: Uint8Array;
  readonly publicKey: PublicKeyString;
  readonly sender: PublicKeyString;
}

export interface SetActiveKey {
  readonly type: PrivateActionType.SET_ACTIVE_KEY;
  readonly index: number;
}

export interface GrantStoreAccess {
  readonly type: PrivateActionType.GRANT_STORE_ACCESS;
  readonly publicKey: PublicKeyString;
  readonly origin: string;
  readonly token: string;
}

export type PrivateAction =
  | ListUsers
  | SubmitPassword
  | CreateUser
  | RestoreUser
  | ImportPrivateKey
  | AddAccount
  | ExportUser
  | SignMessage
  | SignTransaction
  | DecryptMessage
  | SetActiveKey
  | GrantStoreAccess;
