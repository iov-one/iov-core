import { Transaction } from "@iov/types";
import { Observable } from "xstream";
import { Account } from "../types/accounts";
import { KeybasePrivate, KeybasePublic } from "../types/keybase";

export const privateKeybase: KeybasePrivate = {
  addAccount: () => true,
  createUser: () => true,
  exportUser: () => true,
  grantStoreAccess: () => true,
  importPrivateKey: () => true,
  restoreUser: () => true,
  setActiveKey: () => true,
  signTransaction: () => true,
  unlockUser: () => true,
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
  requestAPIAccess: () => true,
  requestSignTransaction: () => true,

  getAccountsObservable: () => accountsObservable,
  getTransactionsObservable: () => transactionsObservable
};
