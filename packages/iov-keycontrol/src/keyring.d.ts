import { ChainId, PublicKeyBundle, SignableBytes, SignatureBytes } from "@iov/types";

// type tagging from https://github.com/Microsoft/TypeScript/issues/4895#issuecomment-399098397
declare class As<Tag extends string> {
  private "_ _ _": Tag;
}

export type KeyringEntrySerializationString = string & As<"keyring-entry-serialization">;
export type KeyringName = string & As<"keyring-name">;

// PublicIdentity is a public key we can identify with on a blockchain
export interface PublicIdentity {
  readonly pubkey: PublicKeyBundle;
}

// LocalIdentity is a local version of a PublicIdentity that contains
// additional local information
export interface LocalIdentity extends PublicIdentity {
  // An optional, local label.
  // This is not exposed to other people or other devices. Use BNS registration for that.
  readonly label?: string;
}

/*
A Keyring is a list of KeyringEntrys
TODO: define interface
*/

/*
KeyringEntry is a generic interface for managing a set of keys and signing
data with them. A KeyringEntry is instanciated using KeyringEntryFactory
and assigned to a Keyring.

A KeyringEntry is responsible for generating secure (random) private keys
and signing with them. KeyringEntry can be implemented in software or as
a bridge to a hardware wallet.

It is inspired by metamask's design:
https://github.com/MetaMask/KeyringController/blob/master/docs/keyring.md
*/
export interface KeyringEntry {
  // createIdentity will create one new identity
  readonly createIdentity: () => Promise<LocalIdentity>;

  // Sets a local label associated with the public identity to be displayed in the UI.
  // To clear a label, set it to undefined
  readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => Promise<void>;

  // getIdentities returns all identities currently registered
  readonly getIdentities: () => ReadonlyArray<LocalIdentity>;

  // canSign flag means the private key material is currently accessible.
  // If a hardware ledger is not plugged in, we may see the public keys,
  // but have it "inactive" as long as this flag is false.
  readonly canSign: boolean;

  // createTransactionSignature will return a detached signature for the signable bytes
  // with the private key that matches the given PublicIdentity.
  // If a matching PublicIdentity is not present in this keyring, throws an Error
  //
  // We provide chainID explicitly (which should be in tx as well), to help
  // an implementation to do checks (such as ledger to switch apps)
  readonly createTransactionSignature: (
    identity: PublicIdentity,
    tx: SignableBytes,
    chainID: ChainId,
  ) => Promise<SignatureBytes>;

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  readonly serialize: () => Promise<KeyringEntrySerializationString>;
}

// A KeyringEntryFactory is a constructor, but since `new` cannot be
// asynchronous, we use the factory model.
//
// The first time a KeyringEntry is created, it will receive no data and
// is responsible for initializing a random state.
// When a KeyringEntry is loaded from stored data, it will be passed
// a KeyDataString that came out of the `serialize` method of the
// same class on a prior run.
export type KeyringEntryFactory = (data?: KeyringEntrySerializationString) => Promise<KeyringEntry>;
