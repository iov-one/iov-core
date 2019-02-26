import { Random } from "@iov/crypto";

import { Preimage } from "./atomicswaptypes";

export class AtomicSwapHelpers {
  public static async createPreimage(): Promise<Preimage> {
    // We use 16 bytes of random data (128 bit entropy)
    // which is enough to avoid brute force attacks
    // given the short lifetime of an atomic swap.
    const bytes = await Random.getBytes(16);
    return bytes as Preimage;
  }
}
