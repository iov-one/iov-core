import {
  ClientNameString,
  ClientTokenString,
  PasswordString,
  PrivateKeyString,
  PublicKeyString,
  SeedString,
  TTLBytes,
  UsernameString,
} from "@iov/types";
import {
  AddAccount,
  CreateUser,
  ExportUser,
  GrantStoreAccess,
  ImportPrivateKey,
  PrivateAction,
  PrivateActionType,
  RestoreUser,
  SetActiveKey,
  SignTransaction,
  UnlockUser,
} from "../types/actions_private";
import { sendTx } from "./iov-types";

export const unlockUserAction: UnlockUser = {
  password: "password123" as PasswordString,
  type: PrivateActionType.UNLOCK_USER,
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
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  transaction: sendTx,
  ttl: null,
  type: PrivateActionType.SIGN_TRANSACTION
};

export const signTransactionActionWithNonceAndTTL: SignTransaction = {
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  transaction: sendTx,
  ttl: new Uint8Array([1, 0, 0, 0]) as TTLBytes,
  type: PrivateActionType.SIGN_TRANSACTION
};

export const setActiveKeyAction: SetActiveKey = {
  index: 5,
  type: PrivateActionType.SET_ACTIVE_KEY
};

export const grantStoreAccessAction: GrantStoreAccess = {
  origin: "my.website.com" as ClientNameString,
  publicKey: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString,
  token: "abcd1234" as ClientTokenString,
  type: PrivateActionType.GRANT_STORE_ACCESS
};

export const handlePrivateAction = (action: PrivateAction) => action;
export const handledPrivateAction = handlePrivateAction(unlockUserAction);
