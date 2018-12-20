import { As } from "type-tagger";

import { ChainId, PrehashType, PublicKeyBundle, SignableBytes, SignatureBytes } from "@iov/bcp-types";
import { Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";

import { Ed25519Wallet } from "./wallets";

export type LocalIdentityId = string & As<"local-identity-id">;

/** a public key we can identify with on a blockchain */
export interface PublicIdentity {
  readonly pubkey: PublicKeyBundle;
}

/**
 * a local version of a PublicIdentity that contains
 * additional local information
 */
export interface LocalIdentity extends PublicIdentity {
  // immutible id string based on pubkey
  readonly id: LocalIdentityId;

  // An optional, local label.
  // This is not exposed to other people or other devices. Use BNS registration for that.
  readonly label?: string;
}

export type WalletId = string & As<"wallet-id">;
export type WalletImplementationIdString = string & As<"wallet-implementation-id">;
export type WalletSerializationString = string & As<"wallet-serialization">;

/**
 * A is a generic interface for managing a set of keys and signing
 * data with them.
 *
 * A Wallet is responsible for storing private keys securely and
 * signing with them. Wallet can be implemented in software or as
 * a bridge to a hardware wallet.
 */
export interface Wallet {
  readonly label: ValueAndUpdates<string | undefined>;

  // id is a unique identifier based on the content of the keyring
  // the same implementation with same seed/secret should have same identifier
  // otherwise, they will be different
  readonly id: WalletId;

  /**
   * Sets a label for this wallet to be displayed in the UI.
   * To clear the label, set it to undefined.
   */
  readonly setLabel: (label: string | undefined) => void;

  // createIdentity will create one new identity
  readonly createIdentity: (
    options: Ed25519Wallet | ReadonlyArray<Slip10RawIndex> | number,
  ) => Promise<LocalIdentity>;

  // Sets a local label associated with the public identity to be displayed in the UI.
  // To clear a label, set it to undefined
  readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => void;

  // getIdentities returns all identities currently registered
  readonly getIdentities: () => ReadonlyArray<LocalIdentity>;

  // canSign flag means the private key material is currently accessible.
  // If a hardware ledger is not plugged in, we may see the public keys,
  // but have it "inactive" as long as this flag is false.
  readonly canSign: ValueAndUpdates<boolean>;

  // A string identifying the concrete implementation of this interface
  // for deserialization purpose
  readonly implementationId: WalletImplementationIdString;

  // createTransactionSignature will return a detached signature for the signable bytes
  // with the private key that matches the given PublicIdentity.
  // If a matching PublicIdentity is not present in this keyring, throws an Error
  //
  // We provide chainID explicitly (which should be in tx as well), to help
  // an implementation to do checks (such as ledger to switch apps)
  readonly createTransactionSignature: (
    identity: PublicIdentity,
    transactionBytes: SignableBytes,
    prehash: PrehashType,
    chainId: ChainId,
  ) => Promise<SignatureBytes>;

  /**
   * Exposes the secret data of this wallet in a printable format for
   * backup purposes.
   *
   * The format depends on the implementation and may change over time,
   * so do not try to parse the result or make any kind of assumtions on
   * how the result looks like.
   */
  readonly printableSecret: () => string;

  // serialize will produce a representation that can be writen to disk.
  // this will contain secret info, so handle securely!
  readonly serialize: () => WalletSerializationString;

  readonly clone: () => Wallet;
}
