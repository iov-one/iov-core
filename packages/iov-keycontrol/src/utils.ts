import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";

export class DatabaseUtils {
  public static async clear<K, V>(db: LevelUp<AbstractLevelDOWN<K, V>>): Promise<void> {
    const keysToClear = new Array<K>();

    return new Promise((resolve, reject) => {
      db.createKeyStream()
        .on("data", (key: K) => {
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
}
