import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import {
  Chacha20poly1305Ietf,
  Chacha20poly1305IetfCiphertext,
  Chacha20poly1305IetfKey,
  Chacha20poly1305IetfMessage,
  Chacha20poly1305IetfNonce,
  Encoding,
  Random,
} from "@iov/crypto";
import { FullSignature, Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/types";

import { Keyring, KeyringEntry, KeyringSerializationString, LocalIdentity, PublicIdentity } from "./keyring";
import { DatabaseUtils } from "./utils";
import { DefaultValueProducer, ValueAndUpdates } from "./valueandupdates";

const { asAscii, fromAscii, fromHex, toHex } = Encoding;

const storageKeyCreatedAt = "created_at";
const storageKeyKeyring = "keyring";

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
    encryptionKey: Chacha20poly1305IetfKey,
  ): Promise<UserProfile> {
    // get from storage (raw strings)
    const createdAtFromStorage = await db.get(storageKeyCreatedAt, { asBuffer: false });
    const keyringFromStorage = await db.get(storageKeyKeyring, { asBuffer: false });

    // process
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
    // This is less likely than winning the German lottery for a given and the following week.
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
  public async storeIn(
    db: LevelUp<AbstractLevelDOWN<string, string>>,
    encryptionKey: Chacha20poly1305IetfKey,
  ): Promise<void> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    await DatabaseUtils.clear(db);

    // process
    const keyringPlaintext = asAscii(this.keyring.serialize()) as Chacha20poly1305IetfMessage;
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
      signature: await entry.createTransactionSignature(identity, bytes, transaction.chainId),
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
