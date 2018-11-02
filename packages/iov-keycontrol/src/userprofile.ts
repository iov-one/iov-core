import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import {
  Argon2id,
  Argon2idOptions,
  Slip10RawIndex,
  Xchacha20poly1305Ietf,
  Xchacha20poly1305IetfCiphertext,
  Xchacha20poly1305IetfKey,
  Xchacha20poly1305IetfNonce,
} from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import { Keyring, KeyringSerializationString } from "./keyring";
import { KeyringEncryptor } from "./keyringencryptor";
import { DatabaseUtils } from "./utils";
import { LocalIdentity, PublicIdentity, Wallet, WalletId } from "./wallet";
import { Ed25519Wallet } from "./wallets";

const { toAscii, fromBase64, toBase64, fromUtf8, toRfc3339, fromRfc3339 } = Encoding;

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
    // get from storage (raw strings)
    const createdAtFromStorage = await db.get(storageKeyCreatedAt, { asBuffer: false });
    const keyringFromStorage = await db.get(storageKeyKeyring, { asBuffer: false });

    // process
    const encryptionKey = (await Argon2id.execute(
      password,
      userProfileSalt,
      weakPasswordHashingOptions,
    )) as Xchacha20poly1305IetfKey;
    const keyringBundle = fromBase64(keyringFromStorage);
    const keyringNonce = keyringBundle.slice(0, 24) as Xchacha20poly1305IetfNonce;
    const keyringCiphertext = keyringBundle.slice(24) as Xchacha20poly1305IetfCiphertext;
    const decrypted = await Xchacha20poly1305Ietf.decrypt(keyringCiphertext, encryptionKey, keyringNonce);
    const keyringSerialization = fromUtf8(decrypted) as KeyringSerializationString;

    // create objects
    const createdAt = fromRfc3339(createdAtFromStorage);
    const keyring = new Keyring(keyringSerialization);
    return new UserProfile({ createdAt, keyring });
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
    const createdAtForStorage = toRfc3339(this.createdAt);
    const keyringForStorage = toBase64(encryptedKeyring);

    // store
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

  /** Creates an identitiy in the wallet with the given ID in the primary keyring */
  public async createIdentity(
    id: WalletId,
    options: Ed25519Wallet | ReadonlyArray<Slip10RawIndex> | number,
  ): Promise<LocalIdentity> {
    const wallet = this.findWalletInPrimaryKeyring(id);
    return wallet.createIdentity(options);
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
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await wallet.createTransactionSignature(identity, bytes, prehashType, transaction.chainId),
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
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await wallet.createTransactionSignature(
        identity,
        bytes,
        prehashType,
        originalTransaction.transaction.chainId,
      ),
    };

    return {
      ...originalTransaction,
      otherSignatures: [...originalTransaction.otherSignatures, newSignature],
    };
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
