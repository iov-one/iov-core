/*
Code for https://github.com/iov-one/iov-core/issues/302

This file just contains a proposal for a new API for this package.
This code will not be run, but by placing it here, we force
it to be tslint/tsc compatible.

Once approved, this should be a template to update the other files in
this package.
*/

import { PrehashType, SignableBytes } from "@iov/bcp-types";
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
  readonly getIdentities: () => ValueAndUpdates<ReadonlyArray<T>>;
  readonly canSign: ValueAndUpdates<boolean>;

  readonly implementationId: KeyringEntryImplementationIdString;
  // it may support ed25519, secp256k1 or both (constant from compile time)
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
  //
  // if autoincrement is true, it will append an auto-incrementing counter
  // to the path as first unused space.
  // eg. if path is 44'/13'/0'/0 and auto-increment is true, it will look
  // see 44'/13'/0'/0/{0,1,2,3} all exist and create with path 44'/13'/0'/0/4
  readonly createIdentityWithPathPrefix: (
    algo: Algorithm,
    path: ReadonlyArray<Slip0010RawIndex>,
    autoincrement: boolean,
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
// export interface UserProfile {
//   addEntry(entry: KeyringEntry): void;
//   setEntryLabel(n: number, label: string | undefined): void;
//   createIdentity(n: number): Promise<LocalIdentity>;
//   setIdentityLabel(n: number, identity: PublicIdentity, label: string | undefined): void;
//   getIdentities(n: number): ReadonlyArray<LocalIdentity>;
//   // signTransaction(n: number, identity: PublicIdentity, transaction: UnsignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
//   // appendSignature(n: number, identity: PublicIdentity, originalTransaction: SignedTransaction, codec: TxCodec, nonce: Nonce): Promise<SignedTransaction>;
// }
