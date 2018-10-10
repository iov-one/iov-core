import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { Nonce, TokenTicker } from "@iov/bcp-types";

import { AmountFields, Parse } from "./parse";

describe("Parse", () => {
  it("can parse zero amount", () => {
    const expected: AmountFields = { whole: 0, fractional: 0, tokenTicker: "RISE" as TokenTicker };
    expect(Parse.riseAmount("0")).toEqual(expected);
    expect(Parse.riseAmount("00")).toEqual(expected);
    expect(Parse.riseAmount("000000000")).toEqual(expected);
  });

  it("can parse 1 RISE", () => {
    const expected: AmountFields = { whole: 1, fractional: 0, tokenTicker: "RISE" as TokenTicker };
    expect(Parse.riseAmount("100000000")).toEqual(expected);
    expect(Parse.riseAmount("00100000000")).toEqual(expected);
    expect(Parse.riseAmount("000000000100000000")).toEqual(expected);
  });

  it("can parse 10 million RISE", () => {
    const expected: AmountFields = { whole: 10000000, fractional: 0, tokenTicker: "RISE" as TokenTicker };
    expect(Parse.riseAmount("1000000000000000")).toEqual(expected);
  });

  it("can parse 100 million RISE", () => {
    const expected: AmountFields = { whole: 100000000, fractional: 0, tokenTicker: "RISE" as TokenTicker };
    expect(Parse.riseAmount("10000000000000000")).toEqual(expected);
  });

  it("can parse 1.23 RISE", () => {
    const expected: AmountFields = { whole: 1, fractional: 23000000, tokenTicker: "RISE" as TokenTicker };
    expect(Parse.riseAmount("123000000")).toEqual(expected);
  });

  it("can parse 1.23456789 RISE", () => {
    const expected: AmountFields = { whole: 1, fractional: 23456789, tokenTicker: "RISE" as TokenTicker };
    expect(Parse.riseAmount("123456789")).toEqual(expected);
  });

  it("parses RISE timestamp 0 as RISE epoch", () => {
    expect(Parse.fromRiseTimestamp(0)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 0, 0)));
  });

  it("can parse positive timestamps", () => {
    // one second
    expect(Parse.fromRiseTimestamp(1)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 1, 0)));
    // one minute
    expect(Parse.fromRiseTimestamp(60)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 1, 0, 0)));
    // one hour
    expect(Parse.fromRiseTimestamp(3600)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 18, 0, 0, 0)),
    );
    // one day
    expect(Parse.fromRiseTimestamp(86400)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 25, 17, 0, 0, 0)),
    );
  });

  it("can parse negative timestamps", () => {
    // one second
    expect(Parse.fromRiseTimestamp(-1)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 59, 0)),
    );
    // one minute
    expect(Parse.fromRiseTimestamp(-60)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 0, 0)),
    );
    // one hour
    expect(Parse.fromRiseTimestamp(-3600)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 0, 0, 0)),
    );
    // one day
    expect(Parse.fromRiseTimestamp(-86400)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 23, 17, 0, 0, 0)),
    );
  });

  it("can convert time to nonce", () => {
    // zero, positive, negative
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1970, 0, 1, 0, 0, 0)))).toEqual(
      Long.fromNumber(0) as Nonce,
    );
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1999, 2, 3, 4, 5, 6)))).toEqual(
      Long.fromNumber(920433906) as Nonce,
    );
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1969, 11, 31, 23, 15, 0)))).toEqual(
      Long.fromNumber(-45 * 60) as Nonce,
    );

    // beyond year 2038
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(2040, 0, 1, 0, 0, 0)))).toEqual(
      Long.fromNumber(2208988800) as Nonce,
    );

    // Out of RISE timestamp range (2016 +/- 70 years). This is not strictly
    // required but shows that we cover the full range and more by storing
    // signed, long UNIX timestamps.
    //
    // python3 -c 'import calendar, datetime; print(calendar.timegm(datetime.datetime(1946, 4, 25, 23, 15, 14, 0).utctimetuple()))'
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1946, 3, 25, 23, 15, 14)))).toEqual(
      Long.fromNumber(-747449086) as Nonce,
    );
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(2086, 3, 25, 23, 15, 14)))).toEqual(
      Long.fromNumber(3670614914) as Nonce,
    );
  });
});
