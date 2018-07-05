import { AbstractLevelDOWN } from "abstract-leveldown";
import levelup, { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import { ChainId, FullSignature, Nonce, SignedTransaction, TxCodec, UnsignedTransaction } from "@iov/types";

import { Keyring, KeyringSerializationString, LocalIdentity, PublicIdentity } from "./keyring";

const storageKeyCreatedAt = "created_at";
const storageKeyKeyring = "keyring";

/**
 * When we unlock a profile, we get a UserProfile handle, which is a
 * "capability" to enable us to use those private keys.
 *
 * All methods must go though the UserProfile
 * (which may just append a token to a private KeyController function).
 * Once the Profile is locked (aka logged out), it can no longer be used.
 */
export class UserProfile {
  public static async loadFrom(storage: AbstractLevelDOWN<string, string>): Promise<UserProfile> {
    const db = levelup(storage);
    const createdAt = new ReadonlyDate(await db.get(storageKeyCreatedAt, { asBuffer: false })); // TODO: add strict RFC 3339 parser
    const keyring = (await db.get(storageKeyKeyring, { asBuffer: false })) as KeyringSerializationString;
    db.close();
    return new UserProfile(createdAt, keyring);
  }

  // unrelated to this class. Can move to a common place
  private static clearDb(db: LevelUp<AbstractLevelDOWN<string, string>>): Promise<void> {
    const keysToClear = new Array<string>();

    return new Promise((resolve, reject) => {
      db.createKeyStream()
        .on("data", (key: string) => {
          keysToClear.push(key);
        })
        .on("error", (error: any) => {
          reject(error);
        })
        .on("close", async () => {
          for (const key of keysToClear) {
            await db.del(key);
          }
          resolve();
        });
    });
  }

  public readonly createdAt: ReadonlyDate;

  // tslint:disable-next-line:readonly-keyword
  private keyring: Keyring | undefined;

  constructor(createdAt: ReadonlyDate, keyringSerialization: KeyringSerializationString) {
    this.createdAt = createdAt;
    this.keyring = new Keyring(keyringSerialization);
  }

  // this will clear everything in storage and create a new UserProfile
  public async storeIn(storage: AbstractLevelDOWN<string, string>): Promise<void> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }

    const db = levelup(storage);
    await UserProfile.clearDb(db);

    await db.put(storageKeyCreatedAt, this.createdAt.toISOString());
    await db.put(storageKeyKeyring, this.keyring.serialize());

    await db.close();
  }

  // removes access to the keyring until we unlock again
  public lock(): void {
    // tslint:disable-next-line:no-object-mutation
    this.keyring = undefined;
  }

  // creates an identitiy in the n-th keyring entry of the primary keyring
  public createIdentity(n: number): Promise<LocalIdentity> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }
    return this.keyring.getEntries()[n].createIdentity();
  }

  // assigns a new label to one of the identities
  // in the n-th keyring entry of the primary keyring
  public setIdentityLabel(n: number, identity: PublicIdentity, label: string | undefined): void {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }
    this.keyring.getEntries()[n].setIdentityLabel(identity, label);
  }

  // get identities of the n-th keyring entry of the primary keyring
  public getIdentities(n: number): ReadonlyArray<LocalIdentity> {
    if (!this.keyring) {
      throw new Error("UserProfile is currently locked");
    }
    return this.keyring.getEntries()[n].getIdentities();
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

    const bytes = codec.bytesToSign(transaction, nonce);
    const signature: FullSignature = {
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await this.keyring
        .getEntries()
        [n].createTransactionSignature(identity, bytes, "chain!" as ChainId),
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

    const bytes = codec.bytesToSign(originalTransaction.transaction, nonce);
    const newSignature: FullSignature = {
      publicKey: identity.pubkey,
      nonce: nonce,
      signature: await this.keyring
        .getEntries()
        [n].createTransactionSignature(identity, bytes, "chain!" as ChainId),
    };

    return {
      transaction: originalTransaction.transaction,
      primarySignature: originalTransaction.primarySignature,
      otherSignatures: [...originalTransaction.otherSignatures, newSignature],
    };
  }
}
