import { splitCode } from "./codeanalyzer";

describe("codeanalyzer", () => {
  describe("splitCode", () => {
    it("can split one", () => {
      const { other, last } = splitCode("var a;");
      expect(other).toEqual("");
      expect(last).toEqual("var a;");
    });

    it("can split two", () => {
      const { other, last } = splitCode("var a; var b;");
      expect(other).toEqual("var a;");
      expect(last).toEqual("var b;");
    });

    it("can split three", () => {
      const { other, last } = splitCode("var a; var b; a = 1");
      expect(other).toEqual("var a;var b;");
      expect(last).toEqual("a = 1");
    });

    it("can split await with brackets", () => {
      const { other, last } = splitCode("await (Promise.resolve(1))");
      expect(other).toEqual("");
      expect(last).toEqual("await (Promise.resolve(1))");
    });
  });
});
