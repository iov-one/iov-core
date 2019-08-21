import {
  ChainId,
  FullSignature,
  Identity,
  identityEquals,
  Nonce,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp";
import { Argon2id, Argon2idOptions, Ed25519Keypair, Slip10RawIndex } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";
import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import { Keyring, WalletInfo } from "./keyring";
import { EncryptedKeyring, KeyringEncryptor } from "./keyringencryptor";
import { DatabaseUtils } from "./utils";
import { ReadonlyWallet, WalletId } from "./wallet";

const { toAscii, fromBase64, toBase64, toRfc3339, fromRfc3339 } = Encoding;

const storageKeyFormatVersion = "format_version";
const storageKeyCreatedAt = "created_at";
const storageKeyKeyring = "keyring";

// not great but can be used on the main thread
const passwordHashingOptionsVersion1: Argon2idOptions = {
  outputLength: 32,
  opsLimit: 10,
  memLimitKib: 8 * 1024,
};

// not great but can be used on the main thread
const passwordHashingOptionsVersion2: Argon2idOptions = {
  outputLength: 32,
  opsLimit: 11,
  memLimitKib: 8 * 1024,
};

// A fixed salt is chosen to archive a deterministic password to key derivation.
// This reduces the scope of a potential rainbow attack to all iov-core users.
// Must be 16 bytes due to implementation limitations.
const userProfileSalt = toAscii("core-userprofile");

/**
 * The format version in which profiles are stored
 *
 * When downgrading IOV-Core should be possible, read support for a new format version
 * should be rolled out before this number is bumped.
 */
const storageFormatVersion = 2;

export interface UserProfileEncryptionKey {
  readonly formatVersion: number;
  readonly data: Uint8Array;
}

/**
 * An error class that allows handling an unexpected format version.
 * It contains all the data needed to derive the encryption key in a different
 * format version using UserProfile.deriveEncryptionKey.
 */
export class UnexpectedFormatVersionError extends Error {
  public readonly expectedFormatVersion: number;
  public readonly actualFormatVersion: number;

  public constructor(expected: number, actual: number) {
    super(
      `Got encryption key of unexpected format. Expected: ${expected} Got: ${actual}. Please derive encryption key in the right format`,
    );
    this.expectedFormatVersion = expected;
    this.actualFormatVersion = actual;
  }
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
export class UserProfile {
  /**
   * Derives an encryption key from the password. This is a computationally intense task that
   * can take many seconds.
   *
   * Use this function to cache the encryption key in memory.
   *
   * @param formatVersion Set this if you got a UnexpectedFormatVersionError. This
   * error usually means a profile was encrypted with an older format version.
   */
  public static async deriveEncryptionKey(
    password: string,
    formatVersion: number = storageFormatVersion,
  ): Promise<UserProfileEncryptionKey> {
    switch (formatVersion) {
      case 1:
        return {
          formatVersion: 1,
          data: await Argon2id.execute(password, userProfileSalt, passwordHashingOptionsVersion1),
        };
      case 2:
        return {
          formatVersion: 2,
          data: await Argon2id.execute(password, userProfileSalt, passwordHashingOptionsVersion2),
        };
      default:
        throw new Error(`Unsupported format version: ${formatVersion}`);
    }
  }

  public static async loadFrom(
    db: LevelUp<AbstractLevelDOWN<string, string>>,
    encryptionSecret: string | UserProfileEncryptionKey,
  ): Promise<UserProfile> {
    const formatVersion = Int53.fromString(
      await db.get(storageKeyFormatVersion, { asBuffer: false }),
    ).toNumber();

    const encryptionKey =
      typeof encryptionSecret === "string"
        ? await UserProfile.deriveEncryptionKey(encryptionSecret, formatVersion)
        : encryptionSecret;

    if (encryptionKey.formatVersion !== formatVersion) {
      throw new UnexpectedFormatVersionError(formatVersion, encryptionKey.formatVersion);
    }

    switch (formatVersion) {
      case 1:
      case 2: {
        // get from storage (raw strings)
        const createdAtFromStorage = await db.get(storageKeyCreatedAt, { asBuffer: false });
        const keyringFromStorage = await db.get(storageKeyKeyring, { asBuffer: false });

        // process
        const encryptedKeyring = fromBase64(keyringFromStorage) as EncryptedKeyring;
        const keyringSerialization = await KeyringEncryptor.decrypt(encryptedKeyring, encryptionKey.data);

        // create objects
        return new UserProfile({
          createdAt: fromRfc3339(createdAtFromStorage),
          keyring: new Keyring(keyringSerialization),
        });
      }
      default:
        throw new Error(`Unsupported format version: ${formatVersion}`);
    }
  }

  public readonly createdAt: ReadonlyDate;
  public readonly locked: ValueAndUpdates<boolean>;
  public readonly wallets: ValueAndUpdates<readonly WalletInfo[]>;

  // Never pass the keyring reference to ensure the keyring is not retained after lock()
  // tslint:disable-next-line:readonly-keyword
  private keyring: Keyring | undefined;
  private readonly lockedProducer: DefaultValueProducer<boolean>;
  private readonly walletsProducer: DefaultValueProducer<readonly WalletInfo[]>;

  /** Stores a copy of keyring */
  public constructor(options?: UserProfileOptions) {
    if (options) {
      this.createdAt = options.createdAt;
      this.keyring = options.keyring.clone();
    } else {
      this.createdAt = new ReadonlyDate(ReadonlyDate.now());
      this.keyring = new Keyring();
    }

    this.lockedProducer = new DefaultValueProducer(false);
    this.locked = new ValueAndUpdates(this.lockedProducer);
    this.walletsProducer = new DefaultValueProducer(this.walletInfos());
    this.wallets = new ValueAndUpdates(this.walletsProducer);
  }

  /**
   * Stores this profile in an open database. This will erase all other data in that database.
   *
   * @param db the target database
   * @param encryptionSecret a password or derivation key used for encryption
   */
  public async storeIn(
    db: LevelUp<AbstractLevelDOWN<string, string>>,
    encryptionSecret: string | UserProfileEncryptionKey,
  ): Promise<void> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    await DatabaseUtils.clear(db);

    const key =
      typeof encryptionSecret === "string"
        ? await UserProfile.deriveEncryptionKey(encryptionSecret)
        : encryptionSecret;
    if (key.formatVersion !== storageFormatVersion) {
      throw new UnexpectedFormatVersionError(storageFormatVersion, key.formatVersion);
    }

    const encryptedKeyring = await KeyringEncryptor.encrypt(this.keyring.serialize(), key.data);

    const formatVersionForStorage = `${storageFormatVersion}`;
    const createdAtForStorage = toRfc3339(this.createdAt);
    const keyringForStorage = toBase64(encryptedKeyring);

    await db.put(storageKeyFormatVersion, formatVersionForStorage);
    await db.put(storageKeyCreatedAt, createdAtForStorage);
    await db.put(storageKeyKeyring, keyringForStorage);
  }

  public lock(): void {
    // tslint:disable-next-line:no-object-mutation
    this.keyring = undefined;
    this.lockedProducer.update(true);
  }

  /**
   * Adds a copy of the wallet to the primary keyring
   */
  public addWallet(wallet: ReadonlyWallet): WalletInfo {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }
    const info = this.keyring.add(wallet);
    this.walletsProducer.update(this.walletInfos());
    return info;
  }

  /** Sets the label of the wallet with the given ID in the primary keyring  */
  public setWalletLabel(walletId: WalletId, label: string | undefined): void {
    this.primaryKeyring().setWalletLabel(walletId, label);
    this.walletsProducer.update(this.walletInfos());
  }

  /**
   * Creates an identity in the wallet with the given ID in the primary keyring
   *
   * The identity is bound to one chain ID to encourage using different
   * keypairs on different chains.
   */
  public async createIdentity(
    walletId: WalletId,
    chainId: ChainId,
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ): Promise<Identity> {
    return this.primaryKeyring().createIdentity(walletId, chainId, options);
  }

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
  public async identityExists(
    walletId: WalletId,
    chainId: ChainId,
    options: Ed25519Keypair | readonly Slip10RawIndex[] | number,
  ): Promise<boolean> {
    const wallet = this.findWalletInPrimaryKeyring(walletId);
    const previewIdentity = await wallet.previewIdentity(chainId, options);
    const existingIdentities = wallet.getIdentities();
    return existingIdentities.find(identity => identityEquals(identity, previewIdentity)) !== undefined;
  }

  /** Assigns a label to one of the identities in the wallet with the given ID in the primary keyring */
  public setIdentityLabel(identity: Identity, label: string | undefined): void {
    this.primaryKeyring().setIdentityLabel(identity, label);
  }

  /**
   * Gets the local label of one of the identities in the wallet with the given ID
   * in the primary keyring
   */
  public getIdentityLabel(identity: Identity): string | undefined {
    const wallet = this.findWalletInPrimaryKeyringByIdentity(identity);
    return wallet.getIdentityLabel(identity);
  }

  /** Get identities of the wallet with the given ID in the primary keyring  */
  public getIdentities(id: WalletId): readonly Identity[] {
    const wallet = this.findWalletInPrimaryKeyring(id);
    return wallet.getIdentities();
  }

  /**
   * All identities of the primary keyring
   */
  public getAllIdentities(): readonly Identity[] {
    const keyring = this.primaryKeyring();
    return keyring.getAllIdentities();
  }

  /**
   * Signs a transaction using the profile's primary keyring. The transaction's
   * creator field specifies the keypair to be used for signing.
   */
  public async signTransaction(
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const wallet = this.findWalletInPrimaryKeyringByIdentity(transaction.creator);

    const { bytes, prehashType } = codec.bytesToSign(transaction, nonce);
    const signature: FullSignature = {
      pubkey: transaction.creator.pubkey,
      nonce: nonce,
      signature: await wallet.createTransactionSignature(transaction.creator, bytes, prehashType),
    };

    return {
      transaction: transaction,
      primarySignature: signature,
      otherSignatures: [],
    };
  }

  public async appendSignature(
    identity: Identity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    if (identity.chainId !== originalTransaction.transaction.creator.chainId) {
      throw new Error("Signing identity's chainId does not match the transaction's chainId");
    }

    const wallet = this.findWalletInPrimaryKeyringByIdentity(identity);

    const { bytes, prehashType } = codec.bytesToSign(originalTransaction.transaction, nonce);
    const newSignature: FullSignature = {
      pubkey: identity.pubkey,
      nonce: nonce,
      signature: await wallet.createTransactionSignature(identity, bytes, prehashType),
    };

    return {
      ...originalTransaction,
      otherSignatures: [...originalTransaction.otherSignatures, newSignature],
    };
  }

  /**
   * Exposes the secret data of a wallet in a printable format for
   * backup purposes.
   *
   * The format depends on the implementation and may change over time,
   * so do not try to parse the result or make any kind of assumtions on
   * how the result looks like.
   */
  public printableSecret(id: WalletId): string {
    const wallet = this.findWalletInPrimaryKeyring(id);
    return wallet.printableSecret();
  }

  /** Throws if the primary keyring is not set, i.e. UserProfile is locked. */
  private primaryKeyring(): Keyring {
    const keyring = this.keyring;
    if (!keyring) {
      throw new Error("UserProfile is currently locked");
    }
    return keyring;
  }

  /** Throws if wallet does not exist in primary keyring */
  private findWalletInPrimaryKeyring(id: WalletId): ReadonlyWallet {
    const keyring = this.primaryKeyring();

    const wallet = keyring.getWallet(id);
    if (!wallet) {
      throw new Error(`Wallet of id '${id}' does not exist in keyring`);
    }

    return wallet;
  }

  private findWalletInPrimaryKeyringByIdentity(identity: Identity): ReadonlyWallet {
    const keyring = this.primaryKeyring();

    const wallet = keyring.getWalletByIdentity(identity);
    if (!wallet) {
      throw new Error(`No wallet for identity '${JSON.stringify(identity)}' found in keyring`);
    }

    return wallet;
  }

  private walletInfos(): readonly WalletInfo[] {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    return this.keyring.getWallets().map(wallet => ({
      id: wallet.id,
      label: wallet.label.value,
    }));
  }
}
