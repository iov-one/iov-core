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
  // nickname is an optional, local name.
  // this is not exposed to other people, use BNS registration for that
  readonly nickname?: string;

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
}

// A KeyringFactory is a constructor, but since `new` cannot be
// asynchronous, we use the factory model.
//
// The first time a Keyring is created, it will receive no data and
// is responsible for initializing a random state.
// When a Keyring is loaded from stored data, it will be passed
// a KeyDataString that came out of the `serialize` method of the
// same class on a prior run.
export type KeyringFactory = (data?: KeyDataString) => Promise<Keyring>;
