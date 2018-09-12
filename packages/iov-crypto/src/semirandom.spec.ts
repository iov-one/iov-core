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
  });
});
