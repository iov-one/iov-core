import {
  ChainID,
  PublicKeyBundle,
  SignableBytes,
  SignatureBytes,
} from "@iov/types";

declare const KeyDataSymbol: unique symbol;
type KeyData = typeof KeyDataSymbol;
export type KeyDataString = KeyData & string;

declare const KeyringNameSymbol: unique symbol;
export type KeyringName = typeof KeyringNameSymbol & string;

// PublicIdentity is a public key we can identify with on a blockchain,
// as well as local info, like our nickname and if it is enabled currently
export interface PublicIdentity extends PublicKeyBundle {
  readonly name?: string;

  // canSign flag means the private key is currently accessible.
  // if a hardware ledger is not plugged in, we may
  // see the public keys, but have it "inactive"
  // as long as this flag is false
  readonly canSign: boolean;
}

/*
Keyring is a generic interface for managing a set of keys and
signing data with them. A KeyController can instantiate these
keyrings and manage persistence, they are responsible for
generating secure (random) private keys and signing with them.

It is inspired by metamask's design:
https://github.com/MetaMask/KeyringController/blob/master/docs/keyring.md
*/
export interface Keyring {
  // createIdentity will create one new identity
  createIdentity: () => Promise<PublicIdentity>;

  // setIdentityName sets the name associated with the public key, if it exists
  setIdentityName: (identity: PublicKeyBundle, name: string) => Promise<true>;

  // getIdentities returns all identities currently registered
  getIdentities: () => Promise<ReadonlyArray<PublicIdentity>>;

  // createTransactionSignature will return a detached signature for the signable bytes
  // with the private key that matches the given PublicIdentity.
  // If a matching PublicIdentity is not present in this keyring, throws an Error
  //
  // We provide chainID explicitly (which should be in tx as well), to help
  // an implementation to do checks (such as ledger to switch apps)
  createTransactionSignature: (
    identity: PublicKeyBundle,
    tx: SignableBytes,
    chainID: ChainID,
  ) => Promise<SignatureBytes>;

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  serialize: () => Promise<KeyDataString>;
  // deserialize will take a string that came from serialize (of the same class)
  // and reinitialize internal state
  deserialize: (data: KeyDataString) => Promise<true>;
}

// KeyringOpts are everything provided to the factory
// We need to figure out what this will hold
export type KeyringOpts = any;

// A KeyringFactory may use the information in opts
// or ignore it, but has no access to other info
export type KeyringFactory = (opts: KeyringOpts) => Keyring;
