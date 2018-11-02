import { Amount, Parse } from "./parse";

describe("Parse", () => {
  it("can parse zero amount", () => {
    const expected: Amount = { whole: 0, fractional: 0 };
    expect(Parse.parseAmount("0")).toEqual(expected);
    expect(Parse.parseAmount("00")).toEqual(expected);
    expect(Parse.parseAmount("000000000")).toEqual(expected);
  });

  it("can parse 1 LSK", () => {
    const expected: Amount = { whole: 1, fractional: 0 };
    expect(Parse.parseAmount("100000000")).toEqual(expected);
    expect(Parse.parseAmount("00100000000")).toEqual(expected);
    expect(Parse.parseAmount("000000000100000000")).toEqual(expected);
  });

  it("can parse 10 million LSK", () => {
    const expected: Amount = { whole: 10000000, fractional: 0 };
    expect(Parse.parseAmount("1000000000000000")).toEqual(expected);
  });

  it("can parse 100 million LSK", () => {
    const expected: Amount = { whole: 100000000, fractional: 0 };
    expect(Parse.parseAmount("10000000000000000")).toEqual(expected);
  });

  it("can parse 1.23 LSK", () => {
    const expected: Amount = { whole: 1, fractional: 23000000 };
    expect(Parse.parseAmount("123000000")).toEqual(expected);
  });

  it("can parse 1.23456789 LSK", () => {
    const expected: Amount = { whole: 1, fractional: 23456789 };
    expect(Parse.parseAmount("123456789")).toEqual(expected);
  });
});
