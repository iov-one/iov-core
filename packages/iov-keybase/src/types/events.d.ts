import {
  // NonceBuffer,
  // PrivateKeyString,
  PublicKeyString
  // SeedString,
  // TTLBuffer
} from "@iov/types";

export const enum PublicEventType {
  ACCESS_GRANTED = "ACCESS_GRANTED",
  PUBLIC_KEY_CHANGED = "PUBLIC_KEY_CHANGED",
  WALLET_LOCKED = "WALLET_LOCKED"
}

export interface WalletLockedEvent {
  readonly type: PublicEventType.WALLET_LOCKED;
}

export interface PublicKeyChangedEvent {
  readonly type: PublicEventType.PUBLIC_KEY_CHANGED;
  readonly key: PublicKeyString;
}

export type PublicEvent = WalletLockedEvent | PublicKeyChangedEvent;
