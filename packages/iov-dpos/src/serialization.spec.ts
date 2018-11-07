import { ReadonlyDate } from "readonly-date";

import { Serialization } from "./serialization";

const { amountFromComponents, toTimestamp } = Serialization;

const epochAsUnixTimestamp = 1464109200;

describe("Serialization", () => {
  describe("toTimestamp", () => {
    it("returns 0 at epoch", () => {
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 0, 0)))).toEqual(0);
    });

    it("can encode time before epoch", () => {
      // one second
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 59, 0)))).toEqual(-1);
      // one minute
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 0, 0)))).toEqual(-60);
      // one hour
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 0, 0, 0)))).toEqual(-3600);
      // one day
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 23, 17, 0, 0, 0)))).toEqual(-86400);
    });

    it("can encode time after epoch", () => {
      // one second
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 1, 0)))).toEqual(1);
      // one minute
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 1, 0, 0)))).toEqual(60);
      // one hour
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 18, 0, 0, 0)))).toEqual(3600);
      // one day
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 25, 17, 0, 0, 0)))).toEqual(86400);
    });

    it("can encode current time", () => {
      expect(toTimestamp(new ReadonlyDate(ReadonlyDate.now()))).toBeGreaterThan(73864000);
    });

    it("is not affected by the year 2038 problem", () => {
      // Example date: 2040-03-21T17:13:22Z
      //
      // Convert to unix timestamp (exceeds int32 range but Python can do it)
      // $ python3 -c 'import calendar, datetime; print(calendar.timegm(datetime.datetime(2040, 3, 21, 17, 13, 22, 0).utctimetuple()))'
      // 2215962802
      const dateIn2040 = new ReadonlyDate(ReadonlyDate.UTC(2040, 2, 21, 17, 13, 22));
      expect(toTimestamp(dateIn2040)).toEqual(2215962802 - epochAsUnixTimestamp);
    });

    it("throws for time 70 years before epoch", () => {
      expect(() =>
        toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016 - 70, 4, 24, 17, 0, 0, 0))),
      ).toThrowError(/not in int32 range/i);
    });

    it("throws for time 70 years after epoch", () => {
      expect(() =>
        toTimestamp(new ReadonlyDate(ReadonlyDate.UTC(2016 + 70, 4, 24, 17, 0, 0, 0))),
      ).toThrowError(/not in int32 range/i);
    });
  });

  describe("amountFromComponents", () => {
    it("works for some simple values", () => {
      expect(amountFromComponents(0, 0).toString()).toEqual("0");
      expect(amountFromComponents(0, 1).toString()).toEqual("1");
      expect(amountFromComponents(0, 123).toString()).toEqual("123");
      expect(amountFromComponents(1, 0).toString()).toEqual("100000000");
      expect(amountFromComponents(123, 0).toString()).toEqual("12300000000");
      expect(amountFromComponents(1, 1).toString()).toEqual("100000001");
      expect(amountFromComponents(1, 23456789).toString()).toEqual("123456789");
    });

    it("works for amount 10 million", () => {
      expect(amountFromComponents(10000000, 0).toString()).toEqual("1000000000000000");
      // set high and low digit to trigger precision bugs in floating point operations
      expect(amountFromComponents(10000000, 1).toString()).toEqual("1000000000000001");
    });

    it("works for amount 100 million", () => {
      expect(amountFromComponents(100000000, 0).toString()).toEqual("10000000000000000");
      // set high and low digit to trigger precision bugs in floating point operations
      expect(amountFromComponents(100000000, 1).toString()).toEqual("10000000000000001");
    });
  });
});
