import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import {
  ChainId,
  FullSignature,
  Nonce,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
} from "@iov/bcp-types";
import { Argon2id, Argon2idOptions, Slip10RawIndex } from "@iov/crypto";
import { Encoding, Int53 } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { Keyring } from "./keyring";
import { EncryptedKeyring, KeyringEncryptor } from "./keyringencryptor";
import { DatabaseUtils } from "./utils";
import { LocalIdentity, PublicIdentity, Wallet, WalletId } from "./wallet";
import { Ed25519Wallet } from "./wallets";

const { toAscii, fromBase64, toBase64, toRfc3339, fromRfc3339 } = Encoding;

const storageKeyFormatVersion = "format_version";
const storageKeyCreatedAt = "created_at";
const storageKeyKeyring = "keyring";

// not great but can be used on the main thread
const weakPasswordHashingOptions: Argon2idOptions = {
  outputLength: 32,
  opsLimit: 10,
  memLimitKib: 8 * 1024,
};
// A fixed salt is choosen to archive a deterministic password to key derivation.
// This reduces the scope of a potential rainbow attack to all iov-core users.
// Must be 16 bytes due to implementation limitations.
const userProfileSalt = toAscii("core-userprofile");

export interface UserProfileOptions {
  readonly createdAt: ReadonlyDate;
  readonly keyring: Keyring;
}

/**
 * Read-only information about one wallet in a keyring/user profile
 */
export interface WalletInfo {
  readonly id: WalletId;
  readonly label: string | undefined;
}

/**
 * All calls must go though the UserProfile. A newly created UserProfile
 * is unlocked until lock() is called, which removes access to private key
 * material. Once locked, a UserProfile cannot be unlocked anymore since the
 * corresponding storage is not available anymore. Instead, re-create the
 * UserProfile via the UserProfileController to get an unlocked UserProfile.
 */
export class UserProfile {
  public static async loadFrom(
    db: LevelUp<AbstractLevelDOWN<string, string>>,
    password: string,
  ): Promise<UserProfile> {
    const formatVersion = Int53.fromString(await db.get(storageKeyFormatVersion, { asBuffer: false }));

    switch (formatVersion.toNumber()) {
      case 1:
        // get from storage (raw strings)
        const createdAtFromStorage = await db.get(storageKeyCreatedAt, { asBuffer: false });
        const keyringFromStorage = await db.get(storageKeyKeyring, { asBuffer: false });

        // process
        const encryptionKey = await Argon2id.execute(password, userProfileSalt, weakPasswordHashingOptions);
        const encryptedKeyring = fromBase64(keyringFromStorage) as EncryptedKeyring;
        const keyringSerialization = await KeyringEncryptor.decrypt(encryptedKeyring, encryptionKey);

        // create objects
        const createdAt = fromRfc3339(createdAtFromStorage);
        const keyring = new Keyring(keyringSerialization);
        return new UserProfile({ createdAt, keyring });
      default:
        throw new Error(`Unsupported format version: ${formatVersion.toNumber()}`);
    }
  }

  public readonly createdAt: ReadonlyDate;
  public readonly locked: ValueAndUpdates<boolean>;
  public readonly wallets: ValueAndUpdates<ReadonlyArray<WalletInfo>>;

  // Never pass the keyring reference to ensure the keyring is not retained after lock()
  // tslint:disable-next-line:readonly-keyword
  private keyring: Keyring | undefined;
  private readonly lockedProducer: DefaultValueProducer<boolean>;
  private readonly walletsProducer: DefaultValueProducer<ReadonlyArray<WalletInfo>>;

  // Stores a copy of keyring
  constructor(options?: UserProfileOptions) {
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

  // this will clear everything in the database and store the user profile
  public async storeIn(db: LevelUp<AbstractLevelDOWN<string, string>>, password: string): Promise<void> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    await DatabaseUtils.clear(db);

    // process
    const encryptionKey = await Argon2id.execute(password, userProfileSalt, weakPasswordHashingOptions);
    const encryptedKeyring = await KeyringEncryptor.encrypt(this.keyring.serialize(), encryptionKey);

    // create storage values (raw strings)
    const formatVersionForStorage = "1";
    const createdAtForStorage = toRfc3339(this.createdAt);
    const keyringForStorage = toBase64(encryptedKeyring);

    // store
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
  public addWallet(wallet: Wallet): WalletInfo {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const copy = wallet.clone();
    this.keyring.add(copy);
    this.walletsProducer.update(this.walletInfos());
    return {
      id: copy.id,
      label: copy.label.value,
    };
  }

  /** Sets the label of the wallet with the given ID in the primary keyring  */
  public setWalletLabel(id: WalletId, label: string | undefined): void {
    const wallet = this.findWalletInPrimaryKeyring(id);
    wallet.setLabel(label);
    this.walletsProducer.update(this.walletInfos());
  }

  /**
   * Creates an identitiy in the wallet with the given ID in the primary keyring
   *
   * The identity is bound to one chain ID to encourage using different
   * keypairs on different chains.
   */
  public async createIdentity(
    id: WalletId,
    chainId: ChainId,
    options: Ed25519Wallet | ReadonlyArray<Slip10RawIndex> | number,
  ): Promise<LocalIdentity> {
    const wallet = this.findWalletInPrimaryKeyring(id);
    return wallet.createIdentity(chainId, options);
  }

  /** Assigns a label to one of the identities in the wallet with the given ID in the primary keyring */
  public setIdentityLabel(id: WalletId, identity: PublicIdentity, label: string | undefined): void {
    const wallet = this.findWalletInPrimaryKeyring(id);
    wallet.setIdentityLabel(identity, label);
  }

  /** Get identities of the wallet with the given ID in the primary keyring  */
  public getIdentities(id: WalletId): ReadonlyArray<LocalIdentity> {
    const wallet = this.findWalletInPrimaryKeyring(id);
    return wallet.getIdentities();
  }

  public async signTransaction(
    id: WalletId,
    identity: PublicIdentity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const wallet = this.findWalletInPrimaryKeyring(id);

    const { bytes, prehashType } = codec.bytesToSign(transaction, nonce);
    const signature: FullSignature = {
      pubkey: identity.pubkey,
      nonce: nonce,
      signature: await wallet.createTransactionSignature(identity, bytes, prehashType),
    };

    return {
      transaction: transaction,
      primarySignature: signature,
      otherSignatures: [],
    };
  }

  public async appendSignature(
    id: WalletId,
    identity: PublicIdentity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const wallet = this.findWalletInPrimaryKeyring(id);

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

  /** Throws if wallet does not exist in primary keyring */
  private findWalletInPrimaryKeyring(id: WalletId): Wallet {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const wallet = this.keyring.getWallet(id);

    if (!wallet) {
      throw new Error(`Wallet of id '${id}' does not exist in keyring`);
    }

    return wallet;
  }

  private walletInfos(): ReadonlyArray<WalletInfo> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    return this.keyring.getWallets().map(wallet => ({
      id: wallet.id,
      label: wallet.label.value,
    }));
  }
}
