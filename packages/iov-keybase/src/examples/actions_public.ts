import { PublicKeyString } from "@iov/types";
import {
  ChangeEvent,
  GetCurrentAccount,
  PublicAction,
  PublicActionType,
  PublicEventType,
  RequestAPIAccess,
  RequestSignMessage,
  RequestSignTransaction
} from "../types/actions_public";

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
  transaction: {
    amount: 123,
    kind: "send",
    sender: "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString
  },
  type: PublicActionType.REQUEST_SIGN_TX
};

export const requestSignMessageAction: RequestSignMessage = {
  message: new Uint8Array([10, 20, 30]),
  type: PublicActionType.REQUEST_SIGN_MESSAGE
};

export const handlePublicAction = (action: PublicAction) => action;
export const handledPublicAction = handlePublicAction(requestAPIAccessAction);
