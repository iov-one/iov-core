import { Amount, TokenTicker } from "@iov/bcp";

import { Parse } from "./parse";

describe("Parse", () => {
  it("can parse zero amount", () => {
    const expected: Amount = {
      quantity: "0",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("0")).toEqual(expected);
    expect(Parse.ethereumAmount("00")).toEqual(expected);
    expect(Parse.ethereumAmount("000000000")).toEqual(expected);
  });

  it("can parse 1 ETH", () => {
    const expected: Amount = {
      quantity: "1000000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1000000000000000000")).toEqual(expected);
    expect(Parse.ethereumAmount("001000000000000000000")).toEqual(expected);
    expect(Parse.ethereumAmount("0000000001000000000000000000")).toEqual(expected);
  });

  it("can parse 10 million ETH", () => {
    const expected: Amount = {
      quantity: "10000000000000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("10000000000000000000000000")).toEqual(expected);
  });

  it("can parse 100 million ETH", () => {
    const expected: Amount = {
      quantity: "100000000000000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("100000000000000000000000000")).toEqual(expected);
  });

  it("can parse 1.23 ETH", () => {
    const expected: Amount = {
      quantity: "1230000000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1230000000000000000")).toEqual(expected);
  });

  it("can parse 1.0023 ETH", () => {
    const expected: Amount = {
      quantity: "1002300000000000000",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1002300000000000000")).toEqual(expected);
  });

  it("can parse 1.234567890123456789 ETH", () => {
    const expected: Amount = {
      quantity: "1234567890123456789",
      fractionalDigits: 18,
      tokenTicker: "ETH" as TokenTicker,
    };
    expect(Parse.ethereumAmount("1234567890123456789")).toEqual(expected);
  });
});
