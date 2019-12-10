import { ChainId, Identity, Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp";
import { Ed25519Keypair, Slip10RawIndex } from "@iov/crypto";
import { ValueAndUpdates } from "@iov/stream";
import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";
import { Keyring, WalletInfo } from "./keyring";
import { ReadonlyWallet, WalletId } from "./wallet";
export interface UserProfileEncryptionKey {
  readonly formatVersion: number;
  readonly data: Uint8Array;
}
/**
 * An error class that allows handling an unexpected format version.
 * It contains all the data needed to derive the encryption key in a different
 * format version using UserProfile.deriveEncryptionKey.
 */
export declare class UnexpectedFormatVersionError extends Error {
  readonly expectedFormatVersion: number;
  readonly actualFormatVersion: number;
  constructor(expected: number, actual: number);
}
export interface UserProfileOptions {
  readonly createdAt: ReadonlyDate;
  readonly keyring: Keyring;
}
/**
 * All calls must go though the UserProfile. A newly created UserProfile
 * is unlocked until lock() is called, which removes access to private key
 * material. Once locked, a UserProfile cannot be unlocked anymore since the
 * corresponding storage is not available anymore. Instead, re-create the
 * UserProfile via the UserProfileController to get an unlocked UserProfile.
 */
export declare class UserProfile {
  /**
   * Derives an encryption key from the password. This is a computationally intense task that
   * can take many seconds.
   *
   * Use this function to cache the encryption key in memory.
   *
   * @param formatVersion Set this if you got a UnexpectedFormatVersionError. This
   * error usually means a profile was encrypted with an older format version.
   */
  static deriveEncryptionKey(password: string, formatVersion?: number): Promise<UserProfileEncryptionKey>;
  static loadFrom(
    db: LevelUp<AbstractLevelDOWN<string, string>>,
    encryptionSecret: string | UserProfileEncryptionKey,
  ): Promise<UserProfile>;
  readonly createdAt: ReadonlyDate;
  readonly locked: ValueAndUpdates<boolean>;
  readonly wallets: ValueAndUpdates<readonly WalletInfo[]>;
  private keyring;
  private readonly lockedProducer;
  private readonly walletsProducer;
  /** Stores a copy of keyring */
  constructor(options?: UserProfileOptions);
  /**
   * Stores this profile in an open database. This will erase all other data in that database.
   *
   * @param db the target database
   * @param encryptionSecret a password or derivation key used for encryption
   */
  storeIn(
    db: LevelUp<AbstractLevelDOWN<string, string>>,
    encryptionSecret: string | UserProfileEncryptionKey,
  ): Promise<void>;
  lock(): void;
  /**
   * Adds a copy of the wallet to the primary keyring
   */
  addWallet(wallet: ReadonlyWallet): WalletInfo;
  /** Sets the label of the wallet with the given ID in the primary keyring  */
  setWalletLabel(walletId: WalletId, label: string | undefined): void;
  /**
   * Creates an identity in the wallet with the given ID in the primary keyring
   *
   * The identity is bound to one chain ID to encourage using different
   * keypairs on different chains.
   */
  createIdentity(
    walletId: WalletId,
    chainId: ChainId,
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ): Promise<Identity>;
  /**
   * Checks if an identity exists in the wallet with the given ID in the primary keyring
   *
   * **Example usage**
   *
   * This allows you to detect which accounts of an HD wallet have been created. Pseudocode
   *
   * ```
   * identityExists("m/44'/234'/0'") == true
   * identityExists("m/44'/234'/1'") == true
   * identityExists("m/44'/234'/2'") == true
   * identityExists("m/44'/234'/3'") == false
   * // Shows that identities with account indices 0–2 have been created.
   * ```
   */
  identityExists(
    walletId: WalletId,
    chainId: ChainId,
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ): Promise<boolean>;
  /** Assigns a label to one of the identities in the wallet with the given ID in the primary keyring */
  setIdentityLabel(identity: Identity, label: string | undefined): void;
  /**
   * Gets the local label of one of the identities in the wallet with the given ID
   * in the primary keyring
   */
  getIdentityLabel(identity: Identity): string | undefined;
  /** Get identities of the wallet with the given ID in the primary keyring  */
  getIdentities(id: WalletId): readonly Identity[];
  /**
   * All identities of the primary keyring
   */
  getAllIdentities(): readonly Identity[];
  /**
   * Signs a transaction using the profile's primary keyring using the provided identity.
   */
  signTransaction(
    identity: Identity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction>;
  appendSignature(
    identity: Identity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction>;
  /**
   * Exposes the secret data of a wallet in a printable format for
   * backup purposes.
   *
   * The format depends on the implementation and may change over time,
   * so do not try to parse the result or make any kind of assumtions on
   * how the result looks like.
   */
  printableSecret(id: WalletId): string;
  /** Throws if the primary keyring is not set, i.e. UserProfile is locked. */
  private primaryKeyring;
  /** Throws if wallet does not exist in primary keyring */
  private findWalletInPrimaryKeyring;
  private findWalletInPrimaryKeyringByIdentity;
  private walletInfos;
}
