import {
  Nonce,
  PasswordString,
  SignableBytes,
  SignatureBytes,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
  UsernameString,
} from "@iov/types";
import {
  AddProfileEvent,
  KeyEvent,
  LockProfileEvent,
  ModifyProfileEvent,
  RemoveProfileEvent,
  UnlockProfileEvent,
  VerifiedTransactionEvent,
} from "./events";
import { LocalIdentity, PublicIdentity } from "./keyring";

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

Question: do we only want to allow max. one "unlocked" user at a time?
In such a case, we can remove the user arg from most of the methods,
and just store the currently unlocked user in the KeyController
*/
export interface KeyController {
  // -------------- Update state ------------
  //
  // This section just updates the current state, any changes
  // can be streamed into the watcher

  // addProfile creates a new user and return a promise to the change event.
  // this event is also sent to the watchState stream, which is meant
  // to update another store (eg. UI redux store).
  //
  // You can usually ignore this promise unless you want to chain this
  readonly addProfile: (user: UsernameString, password: PasswordString) => Promise<AddProfileEvent>;

  // removeProfile requires original password to delete.
  readonly removeProfile: (user: UsernameString, password: PasswordString) => Promise<RemoveProfileEvent>;

  // unlockProfile user gives us access to the private keys for the profile
  readonly unlockProfile: (user: UsernameString, password: PasswordString) => Promise<UnlockProfileEvent>;

  // verifyTransaction will return true if all signatures
  // on the signable transaction are valid.
  // Requires no access to private key material
  readonly verifyTransaction: (tx: SignedTransaction) => Promise<VerifiedTransactionEvent>;
}
