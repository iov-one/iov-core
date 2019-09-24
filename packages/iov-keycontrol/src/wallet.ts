import { ChainId, Identity, PrehashType, SignableBytes, SignatureBytes } from "@iov/bcp";
import { Ed25519Keypair, Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { As } from "type-tagger";

export type WalletId = string & As<"wallet-id">;
export type WalletImplementationIdString = string & As<"wallet-implementation-id">;
export type WalletSerializationString = string & As<"wallet-serialization">;

/** An interface that does not allow mutating any internal state of the Wallet */
export interface ReadonlyWallet {
  readonly label: ValueAndUpdates<string | undefined>;

  // id is a unique identifier based on the content of the keyring
  // the same implementation with same seed/secret should have same identifier
  // otherwise, they will be different
  readonly id: WalletId;

  /**
   * Gets a local label associated with the public identity to be displayed in the UI.
   */
  readonly getIdentityLabel: (identity: Identity) => string | undefined;

  /**
   * Returns all identities currently registered
   */
  readonly getIdentities: () => readonly Identity[];

  // A string identifying the concrete implementation of this interface
  // for deserialization purpose
  readonly implementationId: WalletImplementationIdString;

  /**
   * Creates a new identity from the wallet's secret but does not store it.
   *
   * This allows the Keyring to check for duplicate identities before they
   * are persisted.
   */
  readonly previewIdentity: (
    chainId: ChainId,
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ) => Promise<Identity>;

  /**
   * Created a detached signature for the signable bytes
   * with the private key that matches the given Identity.
   *
   * If a matching Identity is not present in this wallet, an error is thrown.
   */
  readonly createTransactionSignature: (
    identity: Identity,
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

/**
 * A is a generic interface for managing a set of keys and signing
 * data with them.
 *
 * A Wallet is responsible for storing private keys securely and
 * signing with them. Wallet can be implemented in software or as
 * a bridge to a hardware wallet.
 */
export interface Wallet extends ReadonlyWallet {
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
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ) => Promise<Identity>;

  /**
   * Sets a local label associated with the public identity to be displayed in the UI.
   * To clear a label, set it to undefined
   */
  readonly setIdentityLabel: (identity: Identity, label: string | undefined) => void;
}
