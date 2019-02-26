import { AtomicSwapHelpers } from "./atomicswaphelpers";

describe("AtomicSwapHelpers", () => {
  describe("createPreimage", () => {
    it("works", async () => {
      const preimage = await AtomicSwapHelpers.createPreimage();
      expect(preimage.length).toEqual(16);
    });
  });
});
