import { Random, Sha256 } from "@iov/crypto";

import { Hash, Preimage } from "./atomicswaptypes";

export class AtomicSwapHelpers {
  public static async createPreimage(): Promise<Preimage> {
    // We use 16 bytes of random data (128 bit entropy)
    // which is enough to avoid brute force attacks
    // given the short lifetime of an atomic swap.
    const bytes = await Random.getBytes(16);
    return bytes as Preimage;
  }

  /** Creates a SHA256 hash of the preimage */
  public static hashPreimage(preimage: Preimage): Hash {
    return new Sha256(preimage).digest() as Hash;
  }
}
