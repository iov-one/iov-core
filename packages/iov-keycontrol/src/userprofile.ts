import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/bcp-types";
import {
  Argon2id,
  Argon2idOptions,
  Random,
  Xchacha20poly1305Ietf,
  Xchacha20poly1305IetfCiphertext,
  Xchacha20poly1305IetfKey,
  Xchacha20poly1305IetfMessage,
  Xchacha20poly1305IetfNonce,
} from "@iov/crypto";
import { Encoding } from "@iov/encoding";

import {
  Keyring,
  KeyringEntry,
  KeyringEntryId,
  KeyringSerializationString,
  LocalIdentity,
  PublicIdentity,
} from "./keyring";
import { DatabaseUtils } from "./utils";
import { DefaultValueProducer, ValueAndUpdates } from "./valueandupdates";

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

  private static labels(entries: ReadonlyArray<KeyringEntry>): ReadonlyArray<string | undefined> {
    return entries.map(e => e.label.value) as ReadonlyArray<string | undefined>;
  }

  private static ids(entries: ReadonlyArray<KeyringEntry>): ReadonlyArray<KeyringEntryId> {
    return entries.map(e => e.id);
  }

  public readonly createdAt: ReadonlyDate;
  public readonly locked: ValueAndUpdates<boolean>;
  public readonly entriesCount: ValueAndUpdates<number>;
  public readonly entryLabels: ValueAndUpdates<ReadonlyArray<string | undefined>>;
  public readonly entryIds: ValueAndUpdates<ReadonlyArray<KeyringEntryId>>;

  // Never pass the keyring reference to ensure the keyring is not retained after lock()
  // tslint:disable-next-line:readonly-keyword
  private keyring: Keyring | undefined;
  private readonly lockedProducer: DefaultValueProducer<boolean>;
  private readonly entriesCountProducer: DefaultValueProducer<number>;
  private readonly entryLabelsProducer: DefaultValueProducer<ReadonlyArray<string | undefined>>;
  private readonly entryIdsProducer: DefaultValueProducer<ReadonlyArray<KeyringEntryId>>;

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
    // TODO: we really need to clean this up and rethink what we expose where
    // but that would be a breaking change... let's aim for 0.6
    this.entriesCountProducer = new DefaultValueProducer(this.keyring.getEntries().length);
    this.entriesCount = new ValueAndUpdates(this.entriesCountProducer);
    this.entryLabelsProducer = new DefaultValueProducer(UserProfile.labels(this.keyring.getEntries()));
    this.entryLabels = new ValueAndUpdates(this.entryLabelsProducer);
    this.entryIdsProducer = new DefaultValueProducer(UserProfile.ids(this.keyring.getEntries()));
    this.entryIds = new ValueAndUpdates(this.entryIdsProducer);
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
  public addEntry(entry: KeyringEntry): void {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const copy = entry.clone();
    this.keyring.add(copy);
    this.entriesCountProducer.update(this.keyring.getEntries().length);
    this.entryLabelsProducer.update(UserProfile.labels(this.keyring.getEntries()));
    this.entryIdsProducer.update(UserProfile.ids(this.keyring.getEntries()));
  }

  // sets the label of the n-th keyring entry of the primary keyring
  public setEntryLabel(id: number | KeyringEntryId, label: string | undefined): void {
    const entry = this.entryInPrimaryKeyring(id);
    entry.setLabel(label);

    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }
    this.entryLabelsProducer.update(UserProfile.labels(this.keyring.getEntries()));
  }

  // creates an identitiy in the n-th keyring entry of the primary keyring
  public async createIdentity(id: number | KeyringEntryId, options?: any): Promise<LocalIdentity> {
    const entry = this.entryInPrimaryKeyring(id);
    return entry.createIdentity(options);
  }

  // assigns a new label to one of the identities
  // in the n-th keyring entry of the primary keyring
  public setIdentityLabel(
    id: number | KeyringEntryId,
    identity: PublicIdentity,
    label: string | undefined,
  ): void {
    const entry = this.entryInPrimaryKeyring(id);
    entry.setIdentityLabel(identity, label);
  }

  // get identities of the n-th keyring entry of the primary keyring
  public getIdentities(id: number | KeyringEntryId): ReadonlyArray<LocalIdentity> {
    const entry = this.entryInPrimaryKeyring(id);
    return entry.getIdentities();
  }

  public async signTransaction(
    id: number | KeyringEntryId,
    identity: PublicIdentity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const entry = this.entryInPrimaryKeyring(id);

    const { bytes, prehashType } = codec.bytesToSign(transaction, nonce);
    const signature: FullSignature = {
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await entry.createTransactionSignature(identity, bytes, prehashType, transaction.chainId),
    };

    return {
      transaction: transaction,
      primarySignature: signature,
      otherSignatures: [],
    };
  }

  public async appendSignature(
    id: number | KeyringEntryId,
    identity: PublicIdentity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const entry = this.entryInPrimaryKeyring(id);

    const { bytes, prehashType } = codec.bytesToSign(originalTransaction.transaction, nonce);
    const newSignature: FullSignature = {
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await entry.createTransactionSignature(
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

  private entryInPrimaryKeyring(id: number | KeyringEntryId): KeyringEntry {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const entry = typeof id === "number" ? this.keyring.getEntryByIndex(id) : this.keyring.getEntryById(id);

    if (!entry) {
      const kind = typeof id === "number" ? "index" : "id";
      throw new Error(`Entry of ${kind} ${id} does not exist in keyring`);
    }

    return entry;
  }
}
