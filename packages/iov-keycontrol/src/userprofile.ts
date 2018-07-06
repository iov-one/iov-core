import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import { FullSignature, Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/types";

import { Keyring, KeyringEntry, KeyringSerializationString, LocalIdentity, PublicIdentity } from "./keyring";
import { DatabaseUtils } from "./utils";
import { DefaultValueProducer, ValueAndUpdates } from "./valueandupdates";

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
  public static async loadFrom(db: LevelUp<AbstractLevelDOWN<string, string>>): Promise<UserProfile> {
    const createdAt = new ReadonlyDate(await db.get(storageKeyCreatedAt, { asBuffer: false })); // TODO: add strict RFC 3339 parser
    const keyring = new Keyring((await db.get(storageKeyKeyring, {
      asBuffer: false,
    })) as KeyringSerializationString);
    return new UserProfile({ createdAt, keyring });
  }

  public readonly createdAt: ReadonlyDate;
  public readonly locked: ValueAndUpdates<boolean>;
  public readonly entriesCount: ValueAndUpdates<number>;
  public readonly entriyLabels: ValueAndUpdates<ReadonlyArray<string | undefined>>;

  // Never pass the keyring reference to ensure the keyring is not retained after lock()
  // tslint:disable-next-line:readonly-keyword
  private keyring: Keyring | undefined;
  private readonly lockedProducer: DefaultValueProducer<boolean>;
  private readonly entriesCountProducer: DefaultValueProducer<number>;
  private readonly entriyLabelsProducer: DefaultValueProducer<ReadonlyArray<string | undefined>>;

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
    this.entriyLabelsProducer = new DefaultValueProducer(this.keyring
      .getEntries()
      .map(e => e.label.value) as ReadonlyArray<string | undefined>);
    this.entriyLabels = new ValueAndUpdates(this.entriyLabelsProducer);
  }

  // this will clear everything in the database and store the user profile
  public async storeIn(db: LevelUp<AbstractLevelDOWN<string, string>>): Promise<void> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    await DatabaseUtils.clear(db);

    await db.put(storageKeyCreatedAt, this.createdAt.toISOString());
    await db.put(storageKeyKeyring, this.keyring.serialize());
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
  }

  // creates an identitiy in the n-th keyring entry of the primary keyring
  public async createIdentity(n: number): Promise<LocalIdentity> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const entry = this.keyring.getEntries().find((_, index) => index === n);
    if (!entry) {
      throw new Error("Entry of index " + n + " does not exist in keyring");
    }

    return entry.createIdentity();
  }

  // assigns a new label to one of the identities
  // in the n-th keyring entry of the primary keyring
  public setIdentityLabel(n: number, identity: PublicIdentity, label: string | undefined): void {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const entry = this.keyring.getEntries().find((_, index) => index === n);
    if (!entry) {
      throw new Error("Entry of index " + n + " does not exist in keyring");
    }

    entry.setIdentityLabel(identity, label);
  }

  // get identities of the n-th keyring entry of the primary keyring
  public getIdentities(n: number): ReadonlyArray<LocalIdentity> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const entry = this.keyring.getEntries().find((_, index) => index === n);
    if (!entry) {
      throw new Error("Entry of index " + n + " does not exist in keyring");
    }

    return entry.getIdentities();
  }

  public async signTransaction(
    n: number,
    identity: PublicIdentity,
    transaction: UnsignedTransaction,
    codec: TxCodec,
    nonce: Nonce,
  ): Promise<SignedTransaction> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const entry = this.keyring.getEntries().find((_, index) => index === n);
    if (!entry) {
      throw new Error("Entry of index " + n + " does not exist in keyring");
    }

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
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const entry = this.keyring.getEntries().find((_, index) => index === n);
    if (!entry) {
      throw new Error("Entry of index " + n + " does not exist in keyring");
    }

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
}
