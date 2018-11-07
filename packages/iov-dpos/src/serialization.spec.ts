import { ReadonlyDate } from "readonly-date";

import { Serialization } from "./serialization";

const { toTimestamp } = Serialization;

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
});
