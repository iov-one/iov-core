import { Transaction } from "@iov/types";
import { Observable } from "xstream";
import { Account } from "./accounts";

export interface KeybasePublic {
  readonly requestAPIAccess: (options?: {}) => true;
  readonly requestSignTransaction: (transaction: Transaction) => true;

  readonly getAccountsObservable: () => Observable<Account>;
  readonly getTransactionsObservable: () => Observable<Transaction>;
}
