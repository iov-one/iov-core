import { Transaction } from "@iov/types";
import { Observable } from "xstream";
import { Account } from "./accounts";
import {
  PublicAction,
  RequestAPIAccess,
  RequestSignTransaction
} from "./actions_public";

// tslint:disable-next-line:no-class
export default class KeybasePublic {
  public readonly requestAPIAccess: (options?: {}) => RequestAPIAccess;
  public readonly requestSignTransaction: (
    transaction: Transaction
  ) => RequestSignTransaction;

  public readonly getAccountsObservable: () => Observable<Account>;
  public readonly getTransactionsObservable: () => Observable<Transaction>;

  private readonly dispatch: (action: PublicAction) => PublicAction;
}
