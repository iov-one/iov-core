import { TokenTicker } from "@iov/bcp-types";

import { AmountFields, Parse } from "./parse";

describe("Parse", () => {
  it("can parse zero amount", () => {
    const expected: AmountFields = { whole: 0, fractional: 0, tokenTicker: "LSK" as TokenTicker };
    expect(Parse.liskAmount("0")).toEqual(expected);
    expect(Parse.liskAmount("00")).toEqual(expected);
    expect(Parse.liskAmount("000000000")).toEqual(expected);
  });

  it("can parse 1 LSK", () => {
    const expected: AmountFields = { whole: 1, fractional: 0, tokenTicker: "LSK" as TokenTicker };
    expect(Parse.liskAmount("100000000")).toEqual(expected);
    expect(Parse.liskAmount("00100000000")).toEqual(expected);
    expect(Parse.liskAmount("000000000100000000")).toEqual(expected);
  });

  it("can parse 10 million LSK", () => {
    const expected: AmountFields = { whole: 10000000, fractional: 0, tokenTicker: "LSK" as TokenTicker };
    expect(Parse.liskAmount("1000000000000000")).toEqual(expected);
  });

  it("can parse 100 million LSK", () => {
    const expected: AmountFields = { whole: 100000000, fractional: 0, tokenTicker: "LSK" as TokenTicker };
    expect(Parse.liskAmount("10000000000000000")).toEqual(expected);
  });

  it("can parse 1.23 LSK", () => {
    const expected: AmountFields = { whole: 1, fractional: 23000000, tokenTicker: "LSK" as TokenTicker };
    expect(Parse.liskAmount("123000000")).toEqual(expected);
  });

  it("can parse 1.23456789 LSK", () => {
    const expected: AmountFields = { whole: 1, fractional: 23456789, tokenTicker: "LSK" as TokenTicker };
    expect(Parse.liskAmount("123456789")).toEqual(expected);
  });
});
