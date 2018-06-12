import { PasswordString, PublicKeyString, UsernameString } from "@iov/types";
import { Account, User } from "../types/accounts";

export const password: PasswordString = "password123" as PasswordString;

export const username: UsernameString = "my_username" as UsernameString;

export const account: Account = {
  publicKey: "a5bdf5841d9c56d6d975c1ab56ba569c3e367aafa2f9e2ce3dc518eab2594b77" as PublicKeyString,
};

export const user: User = {
  accounts: [account],
  username,
};
