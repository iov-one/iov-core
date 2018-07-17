import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import {
  Argon2id,
  Argon2idOptions,
  Chacha20poly1305Ietf,
  Chacha20poly1305IetfCiphertext,
  Chacha20poly1305IetfKey,
  Chacha20poly1305IetfMessage,
  Chacha20poly1305IetfNonce,
  Random,
} from "@iov/crypto";
import { Encoding } from "@iov/encoding";
import {
  FullSignature,
  Nonce,
  PrehashType,
  SignedTransaction,
  TxCodec,
  UnsignedTransaction,
} from "@iov/types";

import { Keyring, KeyringEntry, KeyringSerializationString, LocalIdentity, PublicIdentity } from "./keyring";
import { DatabaseUtils } from "./utils";
import { DefaultValueProducer, ValueAndUpdates } from "./valueandupdates";

const { toAscii, fromAscii, fromHex, toHex } = Encoding;

const storageKeyCreatedAt = "created_at";
const storageKeyKeyring = "keyring";

// not great but can be used on the main thread
const weakPasswordHashingOptions: Argon2idOptions = {
  outputLength: 32,
  opsLimit: 10,
  memLimitKib: 8 * 1024,
};
// A fixed salt is choosen to archive a deterministic password to key derivation.
// This reduces the scope of a potential rainbow attack to all web4 users.
// Must be 16 bytes due to implementation limitations.
const userProfileSalt = toAscii("web4-userprofile");

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
    )) as Chacha20poly1305IetfKey;
    const keyringBundle = fromHex(keyringFromStorage);
    const keyringNonce = keyringBundle.slice(0, 12) as Chacha20poly1305IetfNonce;
    const keyringCiphertext = keyringBundle.slice(12) as Chacha20poly1305IetfCiphertext;
    const decrypted = await Chacha20poly1305Ietf.decrypt(keyringCiphertext, encryptionKey, keyringNonce);
    const keyringSerialization = fromAscii(decrypted) as KeyringSerializationString;

    // create objects
    const createdAt = new ReadonlyDate(createdAtFromStorage); // TODO: add strict RFC 3339 parser
    const keyring = new Keyring(keyringSerialization);
    return new UserProfile({ createdAt, keyring });
  }

  private static async makeNonce(): Promise<Chacha20poly1305IetfNonce> {
    // With 96 bit random nonces, we can produce N = 250,000,000 nonces
    // while keeping the probability of a collision below one in a trillion
    // https://crypto.stackexchange.com/a/60339
    // This is less likely than winning the German lottery twice in two tries.
    // We consider this safer as implementing a counter that can be manipulated.
    return (await Random.getBytes(12)) as Chacha20poly1305IetfNonce;
  }

  private static labels(entries: ReadonlyArray<KeyringEntry>): ReadonlyArray<string | undefined> {
    return entries.map(e => e.label.value) as ReadonlyArray<string | undefined>;
  }

  public readonly createdAt: ReadonlyDate;
  public readonly locked: ValueAndUpdates<boolean>;
  public readonly entriesCount: ValueAndUpdates<number>;
  public readonly entryLabels: ValueAndUpdates<ReadonlyArray<string | undefined>>;

  // Never pass the keyring reference to ensure the keyring is not retained after lock()
  // tslint:disable-next-line:readonly-keyword
  private keyring: Keyring | undefined;
  private readonly lockedProducer: DefaultValueProducer<boolean>;
  private readonly entriesCountProducer: DefaultValueProducer<number>;
  private readonly entryLabelsProducer: DefaultValueProducer<ReadonlyArray<string | undefined>>;

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
    this.entriesCountProducer = new DefaultValueProducer(this.keyring.getEntries().length);
    this.entriesCount = new ValueAndUpdates(this.entriesCountProducer);
    this.entryLabelsProducer = new DefaultValueProducer(UserProfile.labels(this.keyring.getEntries()));
    this.entryLabels = new ValueAndUpdates(this.entryLabelsProducer);
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
    )) as Chacha20poly1305IetfKey;
    const keyringPlaintext = toAscii(this.keyring.serialize()) as Chacha20poly1305IetfMessage;
    const keyringNonce = await UserProfile.makeNonce();
    const keyringCiphertext = await Chacha20poly1305Ietf.encrypt(
      keyringPlaintext,
      encryptionKey,
      keyringNonce,
    );

    // create storage values (raw strings)
    const createdAtForStorage = this.createdAt.toISOString();
    const keyringForStorage = toHex(keyringNonce) + toHex(keyringCiphertext);

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
  }

  // sets the label of the n-th keyring entry of the primary keyring
  public setEntryLabel(n: number, label: string | undefined): void {
    const entry = this.entryInPrimaryKeyring(n);
    entry.setLabel(label);

    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }
    this.entryLabelsProducer.update(UserProfile.labels(this.keyring.getEntries()));
  }

  // creates an identitiy in the n-th keyring entry of the primary keyring
  public async createIdentity(n: number): Promise<LocalIdentity> {
    const entry = this.entryInPrimaryKeyring(n);
    return entry.createIdentity();
  }

  // assigns a new label to one of the identities
  // in the n-th keyring entry of the primary keyring
  public setIdentityLabel(n: number, identity: PublicIdentity, label: string | undefined): void {
    const entry = this.entryInPrimaryKeyring(n);
    entry.setIdentityLabel(identity, label);
  }

  // get identities of the n-th keyring entry of the primary keyring
  public getIdentities(n: number): ReadonlyArray<LocalIdentity> {
    const entry = this.entryInPrimaryKeyring(n);
    return entry.getIdentities();
  }

  public async signTransaction(
    n: number,
    identity: PublicIdentity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const entry = this.entryInPrimaryKeyring(n);

    const bytes = codec.bytesToSign(transaction, nonce);
    const signature: FullSignature = {
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await entry.createTransactionSignature(
        identity,
        bytes,
        PrehashType.None,
        transaction.chainId,
      ),
    };

    return {
      transaction: transaction,
      primarySignature: signature,
      otherSignatures: [],
    };
  }

  public async appendSignature(
    n: number,
    identity: PublicIdentity,
    originalTransaction: SignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    const entry = this.entryInPrimaryKeyring(n);

    const bytes = codec.bytesToSign(originalTransaction.transaction, nonce);
    const newSignature: FullSignature = {
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await entry.createTransactionSignature(
        identity,
        bytes,
        PrehashType.None,
        originalTransaction.transaction.chainId,
      ),
    };

    return {
      ...originalTransaction,
      otherSignatures: [...originalTransaction.otherSignatures, newSignature],
    };
  }

  private entryInPrimaryKeyring(n: number): KeyringEntry {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const entry = this.keyring.getEntries().find((_, index) => index === n);
    if (!entry) {
      throw new Error("Entry of index " + n + " does not exist in keyring");
    }

    return entry;
  }
}
