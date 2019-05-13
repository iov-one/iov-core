import { makeId } from "./id";

describe("id", () => {
  describe("makeId", () => {
    it("works", () => {
      const firstId = makeId();
      expect(firstId).toBeGreaterThanOrEqual(1);
      expect(makeId()).toEqual(firstId + 1);
      expect(makeId()).toEqual(firstId + 2);
      expect(makeId()).toEqual(firstId + 3);
    });
  });
});
