import { Encoding } from "@iov/encoding";

import { AtomicSwapHelpers } from "./atomicswaphelpers";
import { Preimage } from "./atomicswaptypes";

const { fromHex } = Encoding;

describe("AtomicSwapHelpers", () => {
  describe("createPreimage", () => {
    it("works", async () => {
      const preimage = await AtomicSwapHelpers.createPreimage();
      expect(preimage.length).toEqual(32);
      expect(new Set(preimage).size).toBeGreaterThanOrEqual(25);
    });
  });

  describe("createPreimage", () => {
    it("works", async () => {
      // https://en.wikipedia.org/wiki/SHA-2#Test_vectors
      const preimage = new Uint8Array([]) as Preimage;
      const hash = AtomicSwapHelpers.hashPreimage(preimage);
      expect(hash).toEqual(fromHex("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"));
    });
  });
});
