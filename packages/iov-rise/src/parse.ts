import { ReadonlyDate } from "readonly-date";

import { Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

export class Parse {
  public static fromRiseTimestamp(riseTimestamp: number): ReadonlyDate {
    // RISE timestamp must be in the signed int32 range (to be stored in a Postgres
    // integer column and to be serializeable as 4 bytes) but has no further
    // plausibility restrictions.
    // https://github.com/RiseVision/rise-node/blob/v1.1.1/src/logic/transaction.ts#L346
    if (riseTimestamp < -2147483648 || riseTimestamp > 2147483647) {
      throw new Error("RISE timestamp not in int32 range");
    }

    const riseEpoch = Date.UTC(2016, 4, 24, 17, 0, 0, 0) / 1000;
    const timestamp = riseEpoch + riseTimestamp;
    return new ReadonlyDate(timestamp * 1000);
  }

  /**
   * Convert a point in time to a nonce used in the RISE codec.
   *
   * The nonce stores a UNIX timestamp as integer in seconds resolution.
   * Since we use a Long variable, we are not affected by the year 2038 problem.
   * The full range of possible RISE timestamps (epoch in 2016 +/- 68 years)
   * is covered since we allow negative nonce values.
   *
   * @param date the JavaScript date and time object
   */
  public static timeToNonce(date: ReadonlyDate): Nonce {
    return new Int53(Math.floor(date.getTime() / 1000)) as Nonce;
  }
}
