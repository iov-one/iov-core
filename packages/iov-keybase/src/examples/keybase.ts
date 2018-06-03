import { Transaction } from "@iov/types";
import { Observable } from "xstream";
import { Account } from "../types/accounts";
import { KeybasePublic } from "../types/keybase";

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
