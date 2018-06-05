import { PublicKeyBundle, SignableBytes, SignatureBytes } from "@iov/types";

declare const KeyDataSymbol: unique symbol;
type KeyData = typeof KeyDataSymbol;
export type KeyDataString = KeyData & string;

/*
Keyring is a generic interface for managing a set of keys and
signing data with them. A KeyController can instantiate these
keyrings and manage persistence, they are responsible for
generating secure (random) private keys and signing with them.

It is inspired by metamask's design:
https://github.com/MetaMask/KeyringController/blob/master/docs/keyring.md
*/
export interface Keyring {
  // addAccounts will create n new accounts (default 1)
  addAccounts: (n?: number) => ReadonlyArray<PublicKeyBundle>;
  // getAccounts returns all accounts currently registered
  getAccounts: () => ReadonlyArray<PublicKeyBundle>;
  // signTransaction will return a detached signature for the signable bytes
  // with the private key that matches the given account.
  // If the account is not present in this keyring, throws an Error
  signTransaction: (
    account: PublicKeyBundle,
    tx: SignableBytes
  ) => SignatureBytes;
  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  serialize: () => KeyDataString;
  // deserialize will take a string that came from serialize (of the same class)
  // and reinitialize internal state
  deserialize: (data: KeyDataString) => void;
  // type just provides a label on what this
  type: () => string;
}
