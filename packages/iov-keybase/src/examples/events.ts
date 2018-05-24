import { PublicKeyString, TransactionIDString } from "@iov/types";
import xs from "xstream";
import {
  PublicEvent,
  PublicEventType,
  PublicKeyChangedEvent,
  SendTransactionFailureEvent,
  SendTransactionSuccessEvent,
  SubscribeChanges,
  WalletLockedEvent
} from "../types/events";

const samplePubKey = "0350863ad64a87ae8a2fe83c1af1a8403cb53f53e486d8511dad8a04887e5b2352" as PublicKeyString;
const sampleTxId = "afda0a922b8b40eb645e5caf8ce6cb2f4fe2af84" as TransactionIDString;

export const publicKeyChangedEvent: PublicKeyChangedEvent = {
  key: samplePubKey,
  type: PublicEventType.PUBLIC_KEY_CHANGED
};

export const walletLockedEvent: WalletLockedEvent = {
  type: PublicEventType.WALLET_LOCKED
};

export const sendTransactionSuccessEvent: SendTransactionSuccessEvent = {
  data: Buffer.from("1234567890abcdef", "hex"),
  height: 34000,
  txId: sampleTxId,
  type: PublicEventType.SEND_TRANSACTION_SUCCESS
};

export const sendTransactionFailureEvent: SendTransactionFailureEvent = {
  error: "Invalid base64 encoding at byte 2",
  txId: sampleTxId,
  type: PublicEventType.SEND_TRANSACTION_FAILURE
};

export const subscribe: SubscribeChanges = () =>
  xs.of(
    publicKeyChangedEvent as PublicEvent,
    sendTransactionSuccessEvent,
    walletLockedEvent
  );
