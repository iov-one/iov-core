import { buildTagsQuery } from "./requests";

describe("Requests", () => {
  describe("buildTagsQuery", () => {
    it("works for no tags", () => {
      const query = buildTagsQuery([]);
      expect(query).toEqual("");
    });

    it("works for one tags", () => {
      const query = buildTagsQuery([{ key: "abc", value: "def" }]);
      expect(query).toEqual("abc='def'");
    });

    it("works for two tags", () => {
      const query = buildTagsQuery([{ key: "k", value: "9" }, { key: "L", value: "7" }]);
      expect(query).toEqual("k='9' AND L='7'");
    });
  });
});
