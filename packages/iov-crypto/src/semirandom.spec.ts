// tslint:disable:no-let
import { Encoding } from "@iov/encoding";

import { SemiRandom } from "./semirandom";

const toHex = Encoding.toHex;

describe("Bip39", () => {
  it("can generate a changing byte sequence", () => {
    const seen = new Map<string, boolean>();
    const prng = new SemiRandom("test1");
    for (let i = 0; i < 1000; i++) {
      const bytes = prng.nextBytes();
      const hex = toHex(bytes);
      expect(seen.get(hex)).toBeUndefined();
      seen.set(hex, true);
    }
  });

  it("can generate a changing number sequence", () => {
    const seen = new Map<number, boolean>();
    const prng = new SemiRandom("test2");
    for (let i = 0; i < 1000; i++) {
      const num = prng.random();
      expect(num).toBeGreaterThanOrEqual(0);
      expect(num).toBeLessThanOrEqual(1);
      expect(seen.get(num)).toBeUndefined();
      seen.set(num, true);
    }
  });

  it("generates same data with same seed", () => {
    const prng = new SemiRandom("secret");
    const prng2 = new SemiRandom("secret");
    expect(prng.random()).toEqual(prng2.random());

    const prng3 = new SemiRandom();
    const prng4 = new SemiRandom();
    expect(prng3.random()).toEqual(prng4.random());

    // but the two seeds are different
    expect(prng.random()).not.toEqual(prng3.random());
  });

  it("should have no interference with other prng creation", () => {
    const prng1 = new SemiRandom("top");
    const r1 = prng1.random();

    // make something in between
    const foo = new SemiRandom("foo");
    foo.random();

    // read the first one again
    const r2 = prng1.random();

    // now, seed new prng like original and make sure it is the same (unaffected by foo)
    const prng2 = new SemiRandom("top");
    expect(prng2.random()).toEqual(r1);
    expect(prng2.random()).toEqual(r2);
  });
});
