import { lineCount, executeJavaScript } from "./helpers";

describe("Helpers", () => {
  it("has working line count", () => {
    expect(lineCount("")).toEqual(0);
    expect(lineCount("123\n")).toEqual(1);
    expect(lineCount("\n")).toEqual(1);
    expect(lineCount("123\nabc\n")).toEqual(2);
    expect(lineCount("123\n\nabc\n")).toEqual(3);

    expect(() => lineCount("123")).toThrowError(/final newline missing/);
    expect(() => lineCount(" ")).toThrowError(/final newline missing/);
    expect(() => lineCount("123\nabc")).toThrowError(/final newline missing/);
    expect(() => lineCount("123\n ")).toThrowError(/final newline missing/);
  });

  it("can execute JavaScript", () => {
    expect(executeJavaScript("123", "myfile.js")).toEqual(123);
    expect(executeJavaScript("1+1", "myfile.js")).toEqual(2);
  });
});
