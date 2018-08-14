import { executeJavaScript } from "./helpers";

describe("Helpers", () => {
  it("can execute JavaScript", () => {
    expect(executeJavaScript("123", "myfile.js")).toEqual(123);
    expect(executeJavaScript("1+1", "myfile.js")).toEqual(2);
  });
});
