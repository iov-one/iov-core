import Long from "long";
import { ReadonlyDate } from "readonly-date";

import { Nonce, TokenTicker } from "@iov/bcp-types";

export interface AmountFields {
  readonly whole: number;
  readonly fractional: number;
  readonly tokenTicker: TokenTicker;
}

export class Parse {
  public static liskAmount(str: string): AmountFields {
    const amount = Long.fromString(str, true, 10);
    return {
      whole: amount.divide(100000000).toNumber(),
      fractional: amount.modulo(100000000).toNumber(),
      tokenTicker: "LSK" as TokenTicker,
    };
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
    return Long.fromNumber(Math.floor(date.getTime() / 1000)) as Nonce;
  }
}
