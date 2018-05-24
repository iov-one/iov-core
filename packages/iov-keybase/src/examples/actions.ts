import {
  NonceBuffer,
  PrivateKeyString,
  PublicKeyString,
  SeedString,
  TTLBuffer
} from "@iov/types";
import { PasswordString, UsernameString } from "../types/accounts";
import {
  AddAccount,
  ChangeEvent,
  CreateUser,
  DecryptMessage,
  EncryptMessage,
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
  SubmitPassword,
  VerifyMessage,
  VerifyTransaction
} from "../types/actions";

export const requestAPIAccessAction: RequestAPIAccess = {
  type: PublicActionType.REQUEST_API_ACCESS
};

export const requestAPIAccessActionWithOptions: RequestAPIAccess = {
  options: {
    some: "future option"
  },
  type: PublicActionType.REQUEST_API_ACCESS
};

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
    kind: "send",
    sender: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString
  },
  type: PublicActionType.REQUEST_SIGN_TX
};

export const requestSignMessageAction: RequestSignMessage = {
  message: new Uint8Array([10, 20, 30]),
  type: PublicActionType.REQUEST_SIGN_MESSAGE
};

export const handlePublicAction = (action: PublicAction) => action;
export const handledPublicAction = handlePublicAction(requestAPIAccessAction);

export const listUsersAction: ListUsers = {
  type: PrivateActionType.LIST_USERS
};

export const submitPasswordAction: SubmitPassword = {
  password: "password123" as PasswordString,
  type: PrivateActionType.SUBMIT_PASSWORD,
  username: "my_username" as UsernameString
};

export const createUserAction: CreateUser = {
  password: "password123" as PasswordString,
  type: PrivateActionType.CREATE_USER,
  username: "my_username" as UsernameString
};

export const createUserActionWithOptions: CreateUser = {
  options: {
    some: "future option"
  },
  password: "password123" as PasswordString,
  type: PrivateActionType.CREATE_USER,
  username: "my_username" as UsernameString
};

export const restoreUserAction: RestoreUser = {
  password: "password123" as PasswordString,
  seed: "000102030405060708090a0b0c0d0e0f" as SeedString,
  type: PrivateActionType.RESTORE_USER,
  username: "my_username" as UsernameString
};

export const importPrivateKeyAction: ImportPrivateKey = {
  password: "password123" as PasswordString,
  privateKey: "e9873d79c6d87dc0fb6a5778633389f4453213303da61f20bd67fc233aa33262" as PrivateKeyString,
  type: PrivateActionType.IMPORT_PRIVATE_KEY,
  username: "my_username" as UsernameString
};

export const addAccountAction: AddAccount = {
  type: PrivateActionType.ADD_ACCOUNT
};

export const addAccountActionWithOptions: AddAccount = {
  options: {
    some: "future option"
  },
  type: PrivateActionType.ADD_ACCOUNT
};

export const exportUserAction: ExportUser = {
  password: "password123" as PasswordString,
  type: PrivateActionType.EXPORT_USER,
  username: "my_username" as UsernameString
};

export const exportUserActionWithOptions: ExportUser = {
  options: {
    some: "future option"
  },
  password: "password123" as PasswordString,
  type: PrivateActionType.EXPORT_USER,
  username: "my_username" as UsernameString
};

export const signTransactionAction: SignTransaction = {
  nonce: null,
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  transaction: {
    amount: 123,
    kind: "send",
    sender: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString
  },
  ttl: null,
  type: PrivateActionType.SIGN_TRANSACTION
};

export const signTransactionActionWithNonceAndTTL: SignTransaction = {
  nonce: new Uint8Array([0, 0, 0, 4]) as NonceBuffer,
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  transaction: {
    amount: 123,
    kind: "send",
    sender: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString
  },
  ttl: new Uint8Array([1, 0, 0, 0]) as TTLBuffer,
  type: PrivateActionType.SIGN_TRANSACTION
};

export const verifyTransaction: VerifyTransaction = {
  transaction: {
    amount: 123,
    kind: "send",
    sender: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString
  },
  type: PrivateActionType.VERIFY_TRANSACTION
};

export const signMessageAction: SignMessage = {
  message: new Uint8Array([10, 20, 30]),
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  type: PrivateActionType.SIGN_MESSAGE
};

export const verifyMessageAction: VerifyMessage = {
  message: new Uint8Array([10, 20, 30]),
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  signature: new Uint8Array([40, 50, 61]),
  type: PrivateActionType.VERIFY_MESSAGE
};

export const encryptMessageAction: EncryptMessage = {
  message: new Uint8Array([10, 20, 30]),
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  recipient: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  type: PrivateActionType.ENCRYPT_MESSAGE
};

export const decryptMessageAction: DecryptMessage = {
  message: new Uint8Array([10, 20, 30]),
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  sender: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  type: PrivateActionType.DECRYPT_MESSAGE
};

export const setActiveKeyAction: SetActiveKey = {
  index: 5,
  type: PrivateActionType.SET_ACTIVE_KEY
};

export const grantStoreAccessAction: GrantStoreAccess = {
  origin: "my.website.com",
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  token: "abcd1234",
  type: PrivateActionType.GRANT_STORE_ACCESS
};

export const handlePrivateAction = (action: PrivateAction) => action;
export const handledPrivateAction = handlePrivateAction(listUsersAction);
