import { groupByCallback, maxWithComparatorCallback } from "./utils";

describe("utils", () => {
  describe("groupByCallback", () => {
    it("works", () => {
      const values: readonly any[] = [
        { id: 1, version: 1 },
        { id: 2, version: 1 },
        { id: 3, version: 1 },
        { id: 3, version: 2 },
        { id: 3, version: 3 },
        { id: 1, version: 2 },
        { id: 3, version: 4 },
        { id: 1, version: 3 },
        { id: 2, version: 2 },
      ];
      const grouped = groupByCallback(values, value => value.id);
      expect(grouped).toEqual([
        {
          key: 1,
          values: [
            { id: 1, version: 1 },
            { id: 1, version: 2 },
            { id: 1, version: 3 },
          ],
        },
        {
          key: 2,
          values: [
            { id: 2, version: 1 },
            { id: 2, version: 2 },
          ],
        },
        {
          key: 3,
          values: [
            { id: 3, version: 1 },
            { id: 3, version: 2 },
            { id: 3, version: 3 },
            { id: 3, version: 4 },
          ],
        },
      ]);
    });
  });

  describe("maxWithComparatorCallback", () => {
    it("throws for empty list of values", () => {
      expect(() => maxWithComparatorCallback([], () => 1)).toThrowError(/no values to compare/i);
    });

    it("works", () => {
      const values: readonly any[] = [
        { id: 3, version: 2 },
        { id: 3, version: 4 },
        { id: 3, version: 1 },
        { id: 3, version: 3 },
      ];
      const max = maxWithComparatorCallback(values, (value1, value2) => value1.version - value2.version);
      expect(max).toEqual({ id: 3, version: 4 });
    });
  });
});
