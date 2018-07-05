import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
import { Listener, MemoryStream, Producer } from "xstream";

export class DatabaseUtils {
  public static clear<K, V>(db: LevelUp<AbstractLevelDOWN<K, V>>): Promise<void> {
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

export class MemoryStreamUtils {
  public static value<T>(stream: MemoryStream<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      const listener = {
        next: (value: T) => {
          stream.removeListener(listener);
          resolve(value);
        },
        error: (error: any) => {
          stream.removeListener(listener);
          reject(error);
        },
        complete: () => {
          stream.removeListener(listener);
          reject("Stream completed without providing a value");
        },
      };

      stream.addListener(listener);
    });
  }
}

// allows pre-producing values before anyone is listening
export class DefaultValueProducer<T> implements Producer<T> {
  // tslint:disable-next-line:readonly-keyword
  private value: T;
  // tslint:disable-next-line:readonly-keyword
  private listener: Listener<T> | undefined;

  constructor(value: T) {
    this.value = value;
  }

  public update(value: T): void {
    // tslint:disable-next-line:no-object-mutation
    this.value = value;
    if (this.listener) {
      this.listener.next(value);
    }
  }

  public start(listener: Listener<T>): void {
    // tslint:disable-next-line:no-object-mutation
    this.listener = listener;
    listener.next(this.value);
  }

  public stop(): void {
    // tslint:disable-next-line:no-object-mutation
    this.listener = undefined;
  }
}
