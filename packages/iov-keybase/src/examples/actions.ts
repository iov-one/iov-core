import {
  PublicKeyString,
} from '@iov/types'
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
  PrivateActionType,
  PublicAction,
  PublicActionType,
  PublicEventType,
  RequestAPIAccess,
  RequestSignMessage,
  RequestSignTransaction,
  RestoreUser,
  SetActiveKey,
  SignMessage,
  SignTransaction,
  SubmitPassword
} from "../types/actions";

export const requestAPIAccessAction: RequestAPIAccess = {
  type: PublicActionType.REQUEST_API_ACCESS
};

export const requestAPIAccessActionWithOptions: RequestAPIAccess = {
  options: {
    some: 'future option',
  },
  type: PublicActionType.REQUEST_API_ACCESS,
}

export const getCurrentAccountAction: GetCurrentAccount = {
  type: PublicActionType.GET_CURRENT_ACCOUNT
};

export const changeEventAction: ChangeEvent = {
  event: PublicEventType.ACCESS_GRANTED,
  handler: () => "We were given access",
  type: PublicActionType.CHANGE_EVENT
};

export const requestSignTransactionAction: RequestSignTransaction = {
  transaction: {
    amount: 123,
    kind: 'send',
    sender: '0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352' as PublicKeyString,
  },
  type: PublicActionType.REQUEST_SIGN_TX,
};

export const requestSignMessageAction: RequestSignMessage = {
  message: new Uint8Array([10, 20, 30]),
  type: PublicActionType.REQUEST_SIGN_MESSAGE,
};

export const handlePublicAction = (action: PublicAction) => action;
export const handledPublicAction = handlePublicAction(requestAPIAccessAction);

export const listUsersAction: ListUsers = {
  type: PrivateActionType.LIST_USERS
};

export const submitPasswordAction: SubmitPassword = {
  type: PrivateActionType.SUBMIT_PASSWORD
};

export const createUserAction: CreateUser = {
  type: PrivateActionType.CREATE_USER
};

export const restoreUserAction: RestoreUser = {
  type: PrivateActionType.RESTORE_USER
};

export const importPrivateKeyAction: ImportPrivateKey = {
  type: PrivateActionType.IMPORT_PRIVATE_KEY
};

export const addAccountAction: AddAccount = {
  type: PrivateActionType.ADD_ACCOUNT
};

export const exportUserAction: ExportUser = {
  type: PrivateActionType.EXPORT_USER
};

export const signMessageAction: SignMessage = {
  type: PrivateActionType.SIGN_MESSAGE
};

export const signTransactionAction: SignTransaction = {
  type: PrivateActionType.SIGN_TRANSACTION
};

export const decryptMessageAction: DecryptMessage = {
  type: PrivateActionType.DECRYPT_MESSAGE
};

export const setActiveKeyAction: SetActiveKey = {
  type: PrivateActionType.SET_ACTIVE_KEY
};

export const grantStoreAccessAction: GrantStoreAccess = {
  type: PrivateActionType.GRANT_STORE_ACCESS
};

export const handlePrivateAction = (action: PrivateAction) => action;
export const handledPrivateAction = handlePrivateAction(listUsersAction);
