import { AbstractLevelDOWN } from "abstract-leveldown";
import levelup, { LevelUp } from "levelup";
import { ReadonlyDate } from "readonly-date";

import { Keyring, KeyringSerializationString } from "./keyring";

const storageKeyCreatedAt = "created_at";
const storageKeyKeyring = "keyring";

export class UserProfile {
  public static async loadFrom(storage: AbstractLevelDOWN<string, string>): Promise<UserProfile> {
    const db = levelup(storage);
    const createdAt = new ReadonlyDate(await db.get(storageKeyCreatedAt)); // TODO: add strict RFC 3339 parser
    const keyring = (await db.get(storageKeyKeyring)) as KeyringSerializationString;
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

  private readonly keyring: Keyring;
  private readonly createdAt: ReadonlyDate;

  constructor(createdAt: ReadonlyDate, keyringSerialization: KeyringSerializationString) {
    this.createdAt = createdAt;
    this.keyring = new Keyring(keyringSerialization);
  }

  // this will clear everything in storage and create a new UserProfile
  public async storeIn(storage: AbstractLevelDOWN<string, string>): Promise<void> {
    const db = levelup(storage);
    await UserProfile.clearDb(db);

    await db.put(storageKeyCreatedAt, this.createdAt.toISOString());
    await db.put(storageKeyKeyring, this.keyring.serialize());

    await db.close();
  }

  // TODO: remove this method
  public debug(): string {
    return [this.createdAt.toISOString(), this.keyring.serialize()].join(", ");
  }
}
