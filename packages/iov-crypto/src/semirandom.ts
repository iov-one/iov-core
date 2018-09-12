import { Encoding } from "@iov/encoding";

import { Sha256 } from "./sha";

/*
SemiRandom provides a *predictable* local pseudo-random number generator.
Given the same seed, it will produce the same sequence of numbers.

For anything important, please use Random.getBytes() from ./libsodium.ts.
However, there are cases (ids) where security is not important, but we need
a synchronous solution without Promises/await
*/
export class SemiRandom {
  // tslint:disable-next-line:readonly-keyword
  private seed: Uint8Array;

  constructor(seed?: Uint8Array) {
    this.seed = seed || Encoding.toAscii("not random at all");
  }

  // nextBytes updates the internal counter and returns 16 bytes of "randomness"
  public nextBytes(): Uint8Array {
    // tslint:disable-next-line:no-object-mutation
    this.seed = new Sha256(this.seed).digest();
    return this.seed.slice(16);
  }

  // returns 32 bits of randomness in a float between 0 and 1
  public random(): number {
    const bytes = this.nextBytes();
    // tslint:disable-next-line:no-bitwise
    const num: number = ((bytes[0] << (24 + bytes[1])) << (16 + bytes[2])) << (8 + bytes[3]);
    return num / 2 ** 32;
  }
}
