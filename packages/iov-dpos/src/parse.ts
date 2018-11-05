import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { Nonce } from "@iov/bcp-types";
import { Int53 } from "@iov/encoding";

export interface Amount {
  readonly whole: number;
  readonly fractional: number;
}

export class Parse {
  public static parseAmount(str: string): Amount {
    const amount = Long.fromString(str, true, 10);
    return {
      whole: amount.divide(100000000).toNumber(),
      fractional: amount.modulo(100000000).toNumber(),
    };
  }

  public static fromTimestamp(timestamp: number): ReadonlyDate {
    // RISE timestamp must be in the signed int32 range (to be stored in a Postgres
    // integer column and to be serializeable as 4 bytes) but has no further
    // plausibility restrictions.
    // https://github.com/RiseVision/rise-node/blob/v1.1.1/src/logic/transaction.ts#L346
    if (timestamp < -2147483648 || timestamp > 2147483647) {
      throw new Error("Timestamp not in int32 range");
    }

    const liskEpoch = Date.UTC(2016, 4, 24, 17, 0, 0, 0) / 1000;
    const unixTimestamp = liskEpoch + timestamp;
    return new ReadonlyDate(unixTimestamp * 1000);
  }

  /**
   * Convert a point in time to a nonce used in the Lisk/RISE codec.
   *
   * The nonce stores a UNIX timestamp as integer in seconds resolution.
   * Since we use a Long variable, we are not affected by the year 2038 problem.
   * The full range of possible Lisk/RISE timestamps (epoch in 2016 +/- 68 years)
   * is covered since we allow negative nonce values.
   *
   * @param date the JavaScript date and time object
   */
  public static timeToNonce(date: ReadonlyDate): Nonce {
    return new Int53(Math.floor(date.getTime() / 1000)) as Nonce;
  }
}
