import recast = require("recast");

import { splitCode, convertCodeToFunctionBody } from "./codeanalyzer";

describe("codeanalyzer", () => {
  describe("splitCode", () => {
    it("can split one", () => {
      const { rest, last } = splitCode("var a;");
      expect(recast.print(rest).code).toEqual("");
      expect(recast.print(last).code).toEqual("var a;");
    });

    it("can split two", () => {
      const { rest, last } = splitCode("var a; var b;");
      expect(recast.print(rest).code).toEqual("var a;");
      expect(recast.print(last).code).toEqual("var b;");
    });

    it("can split three", () => {
      const { rest, last } = splitCode("var a; var b; a = 1");
      expect(recast.print(rest).code).toEqual("var a;var b;");
      expect(recast.print(last).code).toEqual("a = 1");
    });

    it("can split empty", () => {
      const { rest, last } = splitCode("");
      expect(recast.print(rest).code).toEqual("");
      expect(recast.print(last).code).toEqual("");
    });

    it("can split await with brackets", () => {
      const { rest, last } = splitCode("await (Promise.resolve(1))");
      expect(recast.print(rest).code).toEqual("");
      expect(recast.print(last).code).toEqual("await (Promise.resolve(1))");
    });

    it("can convert code to function body", () => {
      expect(convertCodeToFunctionBody("")).toEqual("");
      expect(convertCodeToFunctionBody("  ")).toEqual("");
      expect(convertCodeToFunctionBody("\n")).toEqual("");
      expect(convertCodeToFunctionBody(" \n ")).toEqual("");

      expect(convertCodeToFunctionBody("var a = 1;")).toEqual("var a = 1;");
      expect(convertCodeToFunctionBody("const a = Date.now()")).toEqual("const a = Date.now()");

      // expressions
      expect(convertCodeToFunctionBody("1")).toEqual("return 1;");
      expect(convertCodeToFunctionBody("1;")).toEqual("return 1;");
      expect(convertCodeToFunctionBody("a+b")).toEqual("return a+b;");
      expect(convertCodeToFunctionBody("a++;")).toEqual("return a++;");
      expect(convertCodeToFunctionBody("Date.now();")).toEqual("return Date.now();");
      expect(convertCodeToFunctionBody("(1)")).toEqual("return (1);");

      // multiple statements
      expect(convertCodeToFunctionBody("var a = 1; var b = 2;")).toEqual("var a = 1; var b = 2;");
      expect(convertCodeToFunctionBody("var a = 1; a")).toEqual("var a = 1;\nreturn a;");
    });
  });
});
