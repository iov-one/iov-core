import {
  AddAccount,
  ChangeEvent,
  CreateUser,
  DecryptMessage,
  ExportUser,
  GetCurrentAccount,
  GrantStoreAccess,
  ImportPrivateKey,
  ListUsers,
  PrivateAction,
  PublicAction,
  RequestAPIAccess,
  RequestSignMessage,
  RequestSignTx,
  RestoreUser,
  SetActiveKey,
  SignMessage,
  SignTransaction,
  SubmitPassword
} from "../types/actions";

export const requestAPIAccessAction: RequestAPIAccess = {
  type: "REQUEST_API_ACCESS"
};

export const getCurrentAccountAction: GetCurrentAccount = {
  type: "GET_CURRENT_ACCOUNT"
};

export const changeEventAction: ChangeEvent = {
  type: "CHANGE_EVENT"
};

export const requestSignTxAction: RequestSignTx = {
  type: "REQUEST_SIGN_TX"
};

export const requestSignMessageAction: RequestSignMessage = {
  type: "REQUEST_SIGN_MESSAGE"
};

export const handlePublicAction = (action: PublicAction) => action;
export const handledPublicAction = handlePublicAction(requestAPIAccessAction);

export const listUsersAction: ListUsers = {
  type: "LIST_USERS"
};

export const submitPasswordAction: SubmitPassword = {
  type: "SUBMIT_PASSWORD"
};

export const createUserAction: CreateUser = {
  type: "CREATE_USER"
};

export const restoreUserAction: RestoreUser = {
  type: "RESTORE_USER"
};

export const importPrivateKeyAction: ImportPrivateKey = {
  type: "IMPORT_PRIVATE_KEY"
};

export const addAccountAction: AddAccount = {
  type: "ADD_ACCOUNT"
};

export const exportUserAction: ExportUser = {
  type: "EXPORT_USER"
};

export const signMessageAction: SignMessage = {
  type: "SIGN_MESSAGE"
};

export const signTransactionAction: SignTransaction = {
  type: "SIGN_TRANSACTION"
};

export const decryptMessageAction: DecryptMessage = {
  type: "DECRYPT_MESSAGE"
};

export const setActiveKeyAction: SetActiveKey = {
  type: "SET_ACTIVE_KEY"
};

export const grantStoreAccessAction: GrantStoreAccess = {
  type: "GRANT_STORE_ACCESS"
};

export const handlePrivateAction = (action: PrivateAction) => action;
export const handledPrivateAction = handlePrivateAction(listUsersAction);
