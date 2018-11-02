import { ReadonlyDate } from "readonly-date";

import { Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

export class Parse {
  public static fromLiskTimestamp(liskTimestamp: number): ReadonlyDate {
    // Lisk timestamp must be in the signed int32 range (to be stored in a Postgres
    // integer column and to be serializeable as 4 bytes) but has no further
    // plausibility restrictions.
    // https://github.com/LiskHQ/lisk/blob/v1.0.3/logic/transaction.js#L674
    if (liskTimestamp < -2147483648 || liskTimestamp > 2147483647) {
      throw new Error("Lisk timestemp not in int32 range");
    }

    const liskEpoch = Date.UTC(2016, 4, 24, 17, 0, 0, 0) / 1000;
    const timestamp = liskEpoch + liskTimestamp;
    return new ReadonlyDate(timestamp * 1000);
  }

  /**
   * Convert a point in time to a nonce used in the Lisk codec.
   *
   * The nonce stores a UNIX timestamp as integer in seconds resolution.
   * Since we use a Long variable, we are not affected by the year 2038 problem.
   * The full range of possible Lisk timestamps (epoch in 2016 +/- 68 years)
   * is covered since we allow negative nonce values.
   *
   * @param date the JavaScript date and time object
   */
  public static timeToNonce(date: ReadonlyDate): Nonce {
    return new Int53(Math.floor(date.getTime() / 1000)) as Nonce;
  }
}
