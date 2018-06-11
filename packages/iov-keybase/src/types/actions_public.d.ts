import { PasswordString, UsernameString, Transaction } from "@iov/types";

export const enum PublicActionType {
  REQUEST_API_ACCESS = "REQUEST_API_ACCESS",
  REQUEST_SIGN_TX = "REQUEST_SIGN_TX",
}

export interface RequestAPIAccess {
  readonly type: PublicActionType.REQUEST_API_ACCESS;
  readonly options?: {};
}

export interface RequestSignTransaction {
  readonly type: PublicActionType.REQUEST_SIGN_TX;
  readonly transaction: Transaction;
}

export type PublicAction = RequestAPIAccess | RequestSignTransaction;
