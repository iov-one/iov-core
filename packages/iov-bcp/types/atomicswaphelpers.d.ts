import { Hash, Preimage } from "./atomicswaptypes";
export declare class AtomicSwapHelpers {
  static createPreimage(): Promise<Preimage>;
  /** Creates a SHA256 hash of the preimage */
  static hashPreimage(preimage: Preimage): Hash;
}
