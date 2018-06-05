import { Stream } from "xstream";

import { KeyEvent } from "./events";
import {
  PasswordString,
  PublicKeyBundle,
  SignableBytes,
  SignatureBytes,
  UsernameString
} from "@iov/types";

declare const KeyringNameSymbol: unique symbol;
export type KeyringName = typeof KeyringNameSymbol & string;

/*
A KeyController is the main interface to key signing.

It maintains a number of KeyringFactories that can be used
to instantiate Keyrings, each one identified by a unique name.

It also maintains a persistence layer where it can store
the state of a keyring, along with info as to the factory
to use to reconstruct it from the data.

It stores initialized wasm modules for the various crypto
algorithms, which help to initialize the keyrings, and also
allow it to provide functionality to validate signatures
against a public key.

The highest abstraction level is a User.
A user is created with an associated password and keyring.
This password is used to encrypt/decrypt the keyring and
is the only way to access the secret keys.
We provide the concept of "login", which essentially decrypts
the user's keys and provides access to them. And "logout",
which removes this info from memory.

The KeyController also provides an event stream that a UI
can listen to in order to reflect the current state
(which users, which are logged in, which accounts are available).
*/
export interface KeyController {
  //-------------- Update state ------------
  //
  // This section just updates the current state, any changes
  // can be streamed into the watcher

  // TODO: addUser will update state, do we want to return new account here as well?
  // do we want to return errors?
  // is this async or sync?
  addUser: (
    user: UsernameString,
    password: PasswordString,
    keyring: KeyringName
  ) => Promise<true>;

  // deleteUser requires original password to delete.
  // returns a promise that resolves to true or throws error
  deleteUser: (user: UsernameString, password: PasswordString) => Promise<true>;

  // TODO: same questions as above...
  unlockUser: (user: UsernameString, password: PasswordString) => Promise<true>;

  // TODO: same questions as above... but this never fails (unless bad username)
  lockUser: (user: UsernameString) => Promise<true>;

  // TODO: same questions as above...
  addAccounts: (user: UsernameString, n?: number) => Promise<true>;

  // TODO: same questions as above...
  setAccountName: (
    user: UsernameString,
    n: number,
    name: string
  ) => Promise<true>;

  //------------ Watch state --------

  // watchState lets an API reflect current state without worrying about
  // return codes of each action.... actions can just resolve to error
  // to signify failure... or shall those failed tx be another event???
  watchState: () => Stream<KeyEvent>;

  //---------- Perform computations ----
  //
  // These are special... we actually need the return value, not
  // to update the UI state but to continue on in our flow....
  // this is almost a transform.

  // I guess we could scan all users to find where the account matches,
  // not sure if that makes this easier or more confusing?
  signTransaction: (
    user: UsernameString,
    account: PublicKeyBundle,
    tx: SignableBytes
  ) => Promise<SignatureBytes>;

  // verifySignature makes use of the loaded crypto libraries
  // to verify if a signature matches the given key and data
  verifySignature: (
    account: PublicKeyBundle,
    tx: SignableBytes,
    signature: SignatureBytes
  ) => boolean;
}
