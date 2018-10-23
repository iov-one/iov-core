import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import {
  Argon2id,
  Argon2idOptions,
  Random,
  Slip10RawIndex,
  Xchacha20poly1305Ietf,
  Xchacha20poly1305IetfCiphertext,
  Xchacha20poly1305IetfKey,
  Xchacha20poly1305IetfMessage,
  Xchacha20poly1305IetfNonce,
} from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import { DefaultValueProducer, ValueAndUpdates } from "@iov/stream";

import {
  Keyring,
  KeyringSerializationString,
  LocalIdentity,
  PublicIdentity,
  Wallet,
  WalletId,
} from "./keyring";
import { Ed25519Wallet } from "./keyring-entries";
import { DatabaseUtils } from "./utils";

const { toAscii, fromBase64, toBase64, fromUtf8, toUtf8, toRfc3339, fromRfc3339 } = Encoding;

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

  private static async makeNonce(): Promise<Xchacha20poly1305IetfNonce> {
    return (await Random.getBytes(24)) as Xchacha20poly1305IetfNonce;
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
    const encryptionKey = (await Argon2id.execute(
      password,
      userProfileSalt,
      weakPasswordHashingOptions,
    )) as Xchacha20poly1305IetfKey;
    const keyringPlaintext = toUtf8(this.keyring.serialize()) as Xchacha20poly1305IetfMessage;
    const keyringNonce = await UserProfile.makeNonce();
    const keyringCiphertext = await Xchacha20poly1305Ietf.encrypt(
      keyringPlaintext,
      encryptionKey,
      keyringNonce,
    );

    // create storage values (raw strings)
    const createdAtForStorage = toRfc3339(this.createdAt);
    const keyringForStorage = toBase64(new Uint8Array([...keyringNonce, ...keyringCiphertext]));

    // store
    await db.put(storageKeyCreatedAt, createdAtForStorage);
    await db.put(storageKeyKeyring, keyringForStorage);
  }

  public lock(): void {
    // tslint:disable-next-line:no-object-mutation
    this.keyring = undefined;
    this.lockedProducer.update(true);
  }

  // Adds a copy of the entry to the primary keyring
  public addEntry(entry: Wallet): WalletInfo {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const copy = entry.clone();
    this.keyring.add(copy);
    this.walletsProducer.update(this.walletInfos());
    return {
      id: copy.id,
      label: copy.label.value,
    };
  }

  // sets the label of the n-th keyring entry of the primary keyring
  public setEntryLabel(id: WalletId, label: string | undefined): void {
    const wallet = this.entryInPrimaryKeyring(id);
    wallet.setLabel(label);
    this.walletsProducer.update(this.walletInfos());
  }

  // creates an identitiy in the n-th keyring entry of the primary keyring
  public async createIdentity(
    id: WalletId,
    options: Ed25519Wallet | ReadonlyArray<Slip10RawIndex> | number,
  ): Promise<LocalIdentity> {
    const wallet = this.entryInPrimaryKeyring(id);
    return wallet.createIdentity(options);
  }

  // assigns a new label to one of the identities
  // in the n-th keyring entry of the primary keyring
  public setIdentityLabel(id: WalletId, identity: PublicIdentity, label: string | undefined): void {
    const wallet = this.entryInPrimaryKeyring(id);
    wallet.setIdentityLabel(identity, label);
  }

  // get identities of the n-th keyring entry of the primary keyring
  public getIdentities(id: WalletId): ReadonlyArray<LocalIdentity> {
    const wallet = this.entryInPrimaryKeyring(id);
    return wallet.getIdentities();
  }

  public async signTransaction(
    id: WalletId,
    identity: PublicIdentity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const wallet = this.entryInPrimaryKeyring(id);

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
    const wallet = this.entryInPrimaryKeyring(id);

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

  private entryInPrimaryKeyring(id: WalletId): Wallet {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const wallet = this.keyring.getEntryById(id);

    if (!wallet) {
      throw new Error(`Entry of id ${id} does not exist in keyring`);
    }

    return wallet;
  }

  private walletInfos(): ReadonlyArray<WalletInfo> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    return this.keyring.getEntries().map(wallet => ({
      id: wallet.id,
      label: wallet.label.value,
    }));
  }
}
