import { Transaction } from "@iov/types";
import { Observable } from "xstream";
import { Account } from "../types/accounts";
import { KeybasePrivate, KeybasePublic } from "../types/keybase";
import {
  addAccountAction,
  createUserAction,
  exportUserAction,
  grantStoreAccessAction,
  importPrivateKeyAction,
  restoreUserAction,
  setActiveKeyAction,
  signTransactionAction,
  unlockUserAction,
} from './actions_private'
import { requestAPIAccessAction, requestSignTransactionAction} from './actions_public'

export const privateKeybase: KeybasePrivate = {
  addAccount: () => addAccountAction,
  createUser: () => createUserAction,
  exportUser: () => exportUserAction,
  grantStoreAccess: () => grantStoreAccessAction,
  importPrivateKey: () => importPrivateKeyAction,
  restoreUser: () => restoreUserAction,
  setActiveKey: () => setActiveKeyAction,
  signTransaction: () => signTransactionAction,
  unlockUser: () => unlockUserAction,
}

const accountsObservable: Observable<Account> = {
  subscribe: () => ({
    unsubscribe: () => null
  })
};
const transactionsObservable: Observable<Transaction> = {
  subscribe: () => ({
    unsubscribe: () => null
  })
};

export const publicKeybase: KeybasePublic = {
  requestAPIAccess: () => requestAPIAccessAction,
  requestSignTransaction: () => requestSignTransactionAction,

  getAccountsObservable: () => accountsObservable,
  getTransactionsObservable: () => transactionsObservable
};
