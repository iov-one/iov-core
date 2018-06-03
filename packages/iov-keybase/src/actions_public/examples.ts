import { sendTx } from "../examples/iov-types";
import {
  ChangeEvent,
  GetCurrentAccount,
  PublicAction,
  PublicActionType,
  PublicEventType,
  RequestAPIAccess,
  RequestSignMessage,
  RequestSignTransaction
} from "./types";

export const requestAPIAccessAction: RequestAPIAccess = {
  type: PublicActionType.REQUEST_API_ACCESS
};

export const requestAPIAccessActionWithOptions: RequestAPIAccess = {
  options: {
    some: "future option"
  },
  type: PublicActionType.REQUEST_API_ACCESS
};

export const getCurrentAccountAction: GetCurrentAccount = {
  type: PublicActionType.GET_CURRENT_ACCOUNT
};

export const changeEventAction: ChangeEvent = {
  event: PublicEventType.ACCESS_GRANTED,
  handler: () => "We were given access",
  type: PublicActionType.CHANGE_EVENT
};

export const requestSignTransactionAction: RequestSignTransaction = {
  transaction: sendTx,
  type: PublicActionType.REQUEST_SIGN_TX
};

export const requestSignMessageAction: RequestSignMessage = {
  message: new Uint8Array([10, 20, 30]),
  type: PublicActionType.REQUEST_SIGN_MESSAGE
};

export const handlePublicAction = (action: PublicAction) => action;
export const handledPublicAction = handlePublicAction(requestAPIAccessAction);
