import { Nonce } from "@iov/bcp";
import { ReadonlyDate } from "readonly-date";

import { Parse } from "./parse";

describe("Parse", () => {
  it("can parse quantity zero", () => {
    expect(Parse.parseQuantity("0")).toEqual("0");
    expect(Parse.parseQuantity("00")).toEqual("0");
    expect(Parse.parseQuantity("000000000")).toEqual("0");
  });

  it("can parse quantity 1", () => {
    expect(Parse.parseQuantity("100000000")).toEqual("100000000");
    expect(Parse.parseQuantity("00100000000")).toEqual("100000000");
    expect(Parse.parseQuantity("000000000100000000")).toEqual("100000000");
  });

  it("can parse quantity 10 million", () => {
    expect(Parse.parseQuantity("1000000000000000")).toEqual("1000000000000000");
  });

  it("can parse quantity 100 million", () => {
    expect(Parse.parseQuantity("10000000000000000")).toEqual("10000000000000000");
  });

  it("can parse quantity 1.23", () => {
    expect(Parse.parseQuantity("123000000")).toEqual("123000000");
  });

  it("can parse quantity 1.23456789", () => {
    expect(Parse.parseQuantity("123456789")).toEqual("123456789");
  });

  it("can parse quantity 0.00000023", () => {
    expect(Parse.parseQuantity("23")).toEqual("23");
  });

  it("parses timestamp 0 as epoch", () => {
    expect(Parse.fromTimestamp(0)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 0, 0)));
  });

  it("can parse positive timestamps", () => {
    // one second
    expect(Parse.fromTimestamp(1)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 1, 0)));
    // one minute
    expect(Parse.fromTimestamp(60)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 1, 0, 0)));
    // one hour
    expect(Parse.fromTimestamp(3600)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 18, 0, 0, 0)));
    // one day
    expect(Parse.fromTimestamp(86400)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 25, 17, 0, 0, 0)));
  });

  it("can parse negative timestamps", () => {
    // one second
    expect(Parse.fromTimestamp(-1)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 59, 0)));
    // one minute
    expect(Parse.fromTimestamp(-60)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 0, 0)));
    // one hour
    expect(Parse.fromTimestamp(-3600)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 0, 0, 0)));
    // one day
    expect(Parse.fromTimestamp(-86400)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 23, 17, 0, 0, 0)));
  });

  it("can convert time to nonce", () => {
    // zero, positive, negative
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1970, 0, 1, 0, 0, 0)))).toEqual(0 as Nonce);
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1999, 2, 3, 4, 5, 6)))).toEqual(
      920433906 as Nonce,
    );
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1969, 11, 31, 23, 15, 0)))).toEqual(
      (-45 * 60) as Nonce,
    );

    // beyond year 2038
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(2040, 0, 1, 0, 0, 0)))).toEqual(
      2208988800 as Nonce,
    );

    // Out of Lisk timestamp range (2016 +/- 70 years). This is not strictly
    // required but shows that we cover the full range and more by storing
    // signed, long UNIX timestamps.
    //
    // python3 -c 'import calendar, datetime; print(calendar.timegm(datetime.datetime(1946, 4, 25, 23, 15, 14, 0).utctimetuple()))'
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1946, 3, 25, 23, 15, 14)))).toEqual(
      -747449086 as Nonce,
    );
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(2086, 3, 25, 23, 15, 14)))).toEqual(
      3670614914 as Nonce,
    );
  });
});
