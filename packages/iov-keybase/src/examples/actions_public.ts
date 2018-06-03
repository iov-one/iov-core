import {
  PublicAction,
  PublicActionType,
  RequestAPIAccess,
  RequestSignTransaction
} from "../types/actions_public";
import { sendTx } from "./iov-types";

export const requestAPIAccessAction: RequestAPIAccess = {
  type: PublicActionType.REQUEST_API_ACCESS
};

export const requestAPIAccessActionWithOptions: RequestAPIAccess = {
  options: {
    some: "future option"
  },
  type: PublicActionType.REQUEST_API_ACCESS
};

export const requestSignTransactionAction: RequestSignTransaction = {
  transaction: sendTx,
  type: PublicActionType.REQUEST_SIGN_TX
};

export const handlePublicAction = (action: PublicAction) => action;
export const handledPublicAction = handlePublicAction(requestAPIAccessAction);
