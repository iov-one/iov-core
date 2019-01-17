import { As } from "type-tagger";

import { ChainId, PrehashType, PublicIdentity, SignableBytes, SignatureBytes } from "@iov/bcp-types";
import { Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";

import { Ed25519Wallet } from "./wallets";

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

  /**
   * Creates a new identity in the wallet.
   *
   * The identity is bound to one chain ID to encourage using different
   * keypairs on different chains.
   */
  readonly createIdentity: (
    chainId: ChainId,
    options: Ed25519Wallet | ReadonlyArray<Slip10RawIndex> | number,
  ) => Promise<PublicIdentity>;

  /**
   * Sets a local label associated with the public identity to be displayed in the UI.
   * To clear a label, set it to undefined
   */
  readonly setIdentityLabel: (identity: PublicIdentity, label: string | undefined) => void;

  /**
   * Gets a local label associated with the public identity to be displayed in the UI.
   */
  readonly getIdentityLabel: (identity: PublicIdentity) => string | undefined;

  /**
   * Returns all identities currently registered
   */
  readonly getIdentities: () => ReadonlyArray<PublicIdentity>;

  // canSign flag means the private key material is currently accessible.
  // If a hardware ledger is not plugged in, we may see the public keys,
  // but have it "inactive" as long as this flag is false.
  readonly canSign: ValueAndUpdates<boolean>;

  // A string identifying the concrete implementation of this interface
  // for deserialization purpose
  readonly implementationId: WalletImplementationIdString;

  /**
   * Created a detached signature for the signable bytes
   * with the private key that matches the given PublicIdentity.
   *
   * If a matching PublicIdentity is not present in this wallet, an error is thrown.
   */
  readonly createTransactionSignature: (
    identity: PublicIdentity,
    transactionBytes: SignableBytes,
    prehash: PrehashType,
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
