import { ReadonlyDate } from "readonly-date";

import { Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

import { Parse } from "./parse";

describe("Parse", () => {
  it("parses lisk timestamp 0 as Lisk epoch", () => {
    expect(Parse.fromLiskTimestamp(0)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 0, 0)));
  });

  it("can parse positive timestamps", () => {
    // one second
    expect(Parse.fromLiskTimestamp(1)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 0, 1, 0)));
    // one minute
    expect(Parse.fromLiskTimestamp(60)).toEqual(new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 17, 1, 0, 0)));
    // one hour
    expect(Parse.fromLiskTimestamp(3600)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 18, 0, 0, 0)),
    );
    // one day
    expect(Parse.fromLiskTimestamp(86400)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 25, 17, 0, 0, 0)),
    );
  });

  it("can parse negative timestamps", () => {
    // one second
    expect(Parse.fromLiskTimestamp(-1)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 59, 0)),
    );
    // one minute
    expect(Parse.fromLiskTimestamp(-60)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 59, 0, 0)),
    );
    // one hour
    expect(Parse.fromLiskTimestamp(-3600)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 24, 16, 0, 0, 0)),
    );
    // one day
    expect(Parse.fromLiskTimestamp(-86400)).toEqual(
      new ReadonlyDate(ReadonlyDate.UTC(2016, 4, 23, 17, 0, 0, 0)),
    );
  });

  it("can convert time to nonce", () => {
    // zero, positive, negative
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1970, 0, 1, 0, 0, 0)))).toEqual(new Int53(
      0,
    ) as Nonce);
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1999, 2, 3, 4, 5, 6)))).toEqual(new Int53(
      920433906,
    ) as Nonce);
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1969, 11, 31, 23, 15, 0)))).toEqual(new Int53(
      -45 * 60,
    ) as Nonce);

    // beyond year 2038
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(2040, 0, 1, 0, 0, 0)))).toEqual(new Int53(
      2208988800,
    ) as Nonce);

    // Out of Lisk timestamp range (2016 +/- 70 years). This is not strictly
    // required but shows that we cover the full range and more by storing
    // signed, long UNIX timestamps.
    //
    // python3 -c 'import calendar, datetime; print(calendar.timegm(datetime.datetime(1946, 4, 25, 23, 15, 14, 0).utctimetuple()))'
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(1946, 3, 25, 23, 15, 14)))).toEqual(new Int53(
      -747449086,
    ) as Nonce);
    expect(Parse.timeToNonce(new ReadonlyDate(ReadonlyDate.UTC(2086, 3, 25, 23, 15, 14)))).toEqual(new Int53(
      3670614914,
    ) as Nonce);
  });
});
