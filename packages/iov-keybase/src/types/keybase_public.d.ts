import { Transaction } from "@iov/types";
import { Observable } from "xstream";
import { Account } from "./accounts";
import {
  PublicAction,
  RequestAPIAccess,
  RequestSignTransaction,
} from "./actions_public";

/*
TODO:
I'm a bit confused here....

The dispatch on a stateful object makes sense to me.
But the rest, eg. requestAPIAccess create a PublicAction that can then be passed into dispatch.
Why are these Action constructors tied to the class?

Why does dispatch return another action, not eg. Promise<ActionResult>?
*/
// tslint:disable-next-line:no-class
export default class KeybasePublic {
  public readonly requestAPIAccess: (options?: {}) => RequestAPIAccess;
  public readonly requestSignTransaction: (
    transaction: Transaction,
  ) => RequestSignTransaction;

  public readonly getAccountsObservable: () => Observable<Account>;
  public readonly getTransactionsObservable: () => Observable<Transaction>;

  private readonly dispatch: (action: PublicAction) => PublicAction;
}
