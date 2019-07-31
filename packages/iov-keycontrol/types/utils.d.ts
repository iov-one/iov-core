import { AbstractLevelDOWN } from "abstract-leveldown";
import { LevelUp } from "levelup";
export declare class DatabaseUtils {
  static clear<K, V>(db: LevelUp<AbstractLevelDOWN<K, V>>): Promise<void>;
}
