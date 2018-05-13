export interface RequestAPIAccess {
  readonly type: "REQUEST_API_ACCESS";
}

export interface GetCurrentAccount {
  readonly type: "GET_CURRENT_ACCOUNT";
}

export interface ChangeEvent {
  readonly type: "CHANGE_EVENT";
}

export interface RequestSignTx {
  readonly type: "REQUEST_SIGN_TX";
}

export interface RequestSignMessage {
  readonly type: "REQUEST_SIGN_MESSAGE";
}

export type PublicAction =
  | RequestAPIAccess
  | GetCurrentAccount
  | ChangeEvent
  | RequestSignTx
  | RequestSignMessage;

export interface ListUsers {
  readonly type: "LIST_USERS";
}

export interface SubmitPassword {
  readonly type: "SUBMIT_PASSWORD";
}

export interface CreateUser {
  readonly type: "CREATE_USER";
}

export interface RestoreUser {
  readonly type: "RESTORE_USER";
}

export interface ImportPrivateKey {
  readonly type: "IMPORT_PRIVATE_KEY";
}

export interface AddAccount {
  readonly type: "ADD_ACCOUNT";
}

export interface ExportUser {
  readonly type: "EXPORT_USER";
}

export interface SignMessage {
  readonly type: "SIGN_MESSAGE";
}

export interface SignTransaction {
  readonly type: "SIGN_TRANSACTION";
}

export interface DecryptMessage {
  readonly type: "DECRYPT_MESSAGE";
}

export interface SetActiveKey {
  readonly type: "SET_ACTIVE_KEY";
}

export interface GrantStoreAccess {
  readonly type: "GRANT_STORE_ACCESS";
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
