/*
Code for https://github.com/iov-one/iov-core/issues/302

This file just contains a proposal for a new API for this package.
This code will not be run, but by placing it here, we force
it to be tslint/tsc compatible.

Once approved, this should be a template to update the other files in
this package.
*/

import {
  Nonce,
  PrehashType,
  SignableBytes,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Slip0010RawIndex } from "@iov/crypto";
import { Algorithm, ChainId, PrivateKeyBytes, PublicKeyBytes, SignatureBytes } from "@iov/tendermint-types";

import { KeyringEntryImplementationIdString, PublicIdentity } from "./keyring";
import { ValueAndUpdates } from "./valueandupdates";

export interface LocalIdentity extends PublicIdentity {
  readonly label?: string;
}

export interface LocalHDIdentity extends LocalIdentity {
  readonly path: ReadonlyArray<Slip0010RawIndex>;
}

// some utilities like clone, serialize removed for simplicity just
// to focus on key management api.
// this is good enough for signing, for creating keys, you need
// a refinement (HDKeyringEntry or MixedKeyringEntry)
export interface KeyringEntry<T extends PublicIdentity = LocalIdentity> {
  // these store labels locally outside of the key material
  // do we want Promises for the case of proxy connections?
  readonly setLabel: (label: string | undefined) => void;
  readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => void;

  // all state observation should be based on streams (ValueAndUpdates)
  readonly getLabel: () => ValueAndUpdates<string | undefined>;
  readonly getIdentities: () => ValueAndUpdates<ReadonlyArray<T>>;
  readonly canSign: ValueAndUpdates<boolean>;

  readonly implementationId: KeyringEntryImplementationIdString;
  // it may support ed25519, secp256k1 or both (constant from compile time)
  // ideally most KeyringEntries support both (breaking change)
  readonly supportedAlgorithms: ReadonlyArray<Algorithm>;

  // the actual usage of the keys
  readonly createTransactionSignature: (
    identity: PublicIdentity,
    transactionBytes: SignableBytes,
    prehash: PrehashType,
    chainId: ChainId,
  ) => Promise<SignatureBytes>;
}

export const enum KeyringType {
  HD = "HD",
  // Need a better name here, for a bunch of keys with no relation...
  // either randomly generated, imported, etc....
  Mixed = "Mixed",
}

export interface HDKeyringEntry extends KeyringEntry<LocalHDIdentity> {
  readonly kind: KeyringType.HD;

  // generate a new HD keyring identity with a given path
  // a keyring entry may support many possible paths, or only one.
  // if path or algorithm is not supported by the implementation,
  // it will throw an error
  readonly createIdentityWithPathPrefix: (
    algo: Algorithm,
    // purpose should be hard-coded as 44' ?
    purpose: Slip0010RawIndex,
    coinType: Slip0010RawIndex,
    account: Slip0010RawIndex,
    change: Slip0010RawIndex,
    addressIndex: Slip0010RawIndex,
  ) => Promise<LocalHDIdentity>;
}

// Keypair is a private and public key for the given algorithm
export interface Keypair {
  readonly algo: Algorithm;
  readonly public: PublicKeyBytes;
  readonly private: PrivateKeyBytes;
}

export interface MixedKeyringEntry extends KeyringEntry<LocalIdentity> {
  readonly kind: KeyringType.Mixed;

  // randomly generate a new private-public key pair
  readonly createRandomIdentity: (algo: Algorithm) => Promise<LocalIdentity>;

  // import existing public/private key pair
  readonly importIdentity: (keypair: Keypair) => Promise<LocalIdentity>;
}

// skipping defining load/store/lock or listeners, as they would
// remain as is.
export interface UserProfile {
  // actually, can we make this `addKeyring(entry: Keyring)`
  // I don't think the Entry word adds clarity....
  readonly addEntry: (entry: KeyringEntry) => void;

  // this changes upon addEntry, watch the individual entries
  // for changes on their state.
  //
  // Note that this assumes the caller is trusted as we expose the
  // full entries (including ability to create identities).
  //
  // Also, it will not work well over proxies as it stands (which
  // should be fixed shortly).
  readonly getEntries: () => ValueAndUpdates<ReadonlyArray<KeyringEntry>>;

  // setEntryLabel should be called on the Entry itself
  // as should specific 'createIdentity' replacement and 'setIdentityLabel'

  // UserProfile should be smart enough to dispatch to proper KeyringEntry
  // based on PublicIdentity. It has updates from all entries and
  // can keep an internal mapping. There is some overhead here, but
  // it greatly simplifies the API
  readonly signTransaction: (
    identity: PublicIdentity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ) => Promise<SignedTransaction>;
  readonly appendSignature: (
    identity: PublicIdentity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ) => Promise<SignedTransaction>;
}
