import { Transaction } from "@iov/types";
import { PasswordString, UsernameString } from "./accounts";

export const enum PublicActionType {
  REQUEST_API_ACCESS = "REQUEST_API_ACCESS",
  GET_CURRENT_ACCOUNT = "GET_CURRENT_ACCOUNT",
  REQUEST_SIGN_TX = "REQUEST_SIGN_TX"
}

export interface RequestAPIAccess {
  readonly type: PublicActionType.REQUEST_API_ACCESS;
  readonly options?: {};
}

export interface GetCurrentAccount {
  readonly type: PublicActionType.GET_CURRENT_ACCOUNT;
}

export interface RequestSignTransaction {
  readonly type: PublicActionType.REQUEST_SIGN_TX;
  readonly transaction: Transaction;
}

export type PublicAction = RequestAPIAccess | RequestSignTransaction;
