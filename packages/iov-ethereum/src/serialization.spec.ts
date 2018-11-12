import { Serialization } from "./serialization";

const { amountFromComponents } = Serialization;

describe("amountFromComponents", () => {
  it("works for some simple values", () => {
    expect(amountFromComponents(0, 0)).toEqual("0");
    expect(amountFromComponents(0, 1)).toEqual("1");
    expect(amountFromComponents(0, 123)).toEqual("123");
    expect(amountFromComponents(1, 0)).toEqual("1000000000000000000");
    expect(amountFromComponents(123, 0)).toEqual("123000000000000000000");
    expect(amountFromComponents(1, 1)).toEqual("1000000000000000001");
    expect(amountFromComponents(1, 23456789)).toEqual("1000000000023456789");
    // move whole and fractional to string
    // expect(amountFromComponents(1, 234567890123456789)).toEqual("1234567890123456789");
  });

  it("works for amount 10 million", () => {
    expect(amountFromComponents(10000000, 0)).toEqual("10000000000000000000000000");
    expect(amountFromComponents(10000000, 1)).toEqual("10000000000000000000000001");
  });

  it("works for amount 100 million", () => {
    expect(amountFromComponents(100000000, 0)).toEqual("100000000000000000000000000");
    expect(amountFromComponents(100000000, 1)).toEqual("100000000000000000000000001");
  });
});
