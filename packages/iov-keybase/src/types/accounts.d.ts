import { PublicKeyString } from "@iov/types";

declare const UsernameSymbol: unique symbol;
type Username = typeof UsernameSymbol;
export type UsernameString = Username & string;

declare const PasswordSymbol: unique symbol;
type Password = typeof PasswordSymbol;
export type PasswordString = Password & string;

export interface Account {
  readonly publicKey: PublicKeyString;
}
