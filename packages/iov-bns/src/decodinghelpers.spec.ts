import { decodeString } from "./decodinghelpers";

describe("decodinghelpers", () => {
  describe("decodeString", () => {
    it("works", () => {
      expect(decodeString("")).toEqual("");
      expect(decodeString(null)).toEqual("");
      expect(decodeString(undefined)).toEqual("");

      expect(decodeString("foo")).toEqual("foo");
    });
  });
});
