import { Random, Sha256 } from "@iov/crypto";

import { Hash, Preimage } from "./atomicswaptypes";

export class AtomicSwapHelpers {
  public static async createPreimage(): Promise<Preimage> {
    const bytes = Random.getBytes(32);
    return bytes as Preimage;
  }

  /** Creates a SHA256 hash of the preimage */
  public static hashPreimage(preimage: Preimage): Hash {
    return new Sha256(preimage).digest() as Hash;
  }
}
