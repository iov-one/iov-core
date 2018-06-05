import { UsernameString, PublicKeyString } from "@iov/types";

export interface Account {
  readonly publicKey: PublicKeyString;
}

export interface User {
  readonly username: UsernameString;
  readonly accounts: ReadonlyArray<Account>;
}
