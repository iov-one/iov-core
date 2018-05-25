import { PublicKeyString } from "./keys";

declare const NonceSymbol: unique symbol;
type Nonce = typeof NonceSymbol;
export type NonceBuffer = Nonce & Uint8Array;
export type NonceString = Nonce & string;

declare const TransactionIDSymbol: unique symbol;
type TransactionID = typeof TransactionIDSymbol;
export type TransactionIDBuffer = TransactionID & Uint8Array;
export type TransactionIDString = TransactionID & string;

declare const TTLSymbol: unique symbol;
type TTL = typeof TTLSymbol;
export type TTLBuffer = TTL & Uint8Array;
export type TTLString = TTL & string;

// TODO: Transaction needs clear definition... talk with Isabella as well
export interface Transaction {
  readonly amount: number;
  readonly kind: string;
  readonly sender: PublicKeyString;
}

export type Identifier = (tx: Transaction) => TransactionIDString;
