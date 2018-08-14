import { convertCodeToFunctionBody } from "./codeanalyzer";

describe("codeanalyzer", () => {
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
