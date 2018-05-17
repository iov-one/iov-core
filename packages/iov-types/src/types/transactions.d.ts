import {
  PublicKeyString,
} from './keys'

declare const NonceSymbol: unique symbol;
type Nonce = typeof NonceSymbol;
export type NonceBuffer = Nonce & Uint8Array;
export type NonceString = Nonce & string;

export interface Transaction {
  readonly amount: number,
  readonly kind: string,
  readonly sender: PublicKeyString,
}
